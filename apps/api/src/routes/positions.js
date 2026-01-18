/**
 * @file positions.js
 * @description Player position tracking with SQLite persistence and map integration
 * 
 * This module tracks player positions over time using a SQLite database.
 * Position data is ingested from the mod's JSON files and stored for
 * historical analysis, heatmaps, and player movement tracking.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * DATABASE:
 * Uses SQLite via better-sqlite3 for high-performance position storage.
 * Table: positions (player_id, x, y, z, timestamp, map)
 * 
 * ENDPOINTS:
 * - GET  /stats            - Database statistics (row count, size)
 * - GET  /player/:id       - Get position history for a player
 * - GET  /timerange        - Get positions within time range
 * - GET  /heatmap          - Get position density data for heatmap
 * - GET  /active           - Get currently active player positions
 * - POST /ingest           - Manually trigger position file ingestion
 * 
 * DATA FLOW:
 * 1. DayZ mod writes player positions to JSON file periodically
 * 2. Server polls this file (configurable interval)
 * 3. New positions inserted into SQLite database
 * 4. Dashboard queries database for visualization
 * 
 * POSITION FILE FORMAT:
 * { "players": [{ "playerId": "...", "x": 0, "y": 0, "z": 0 }] }
 * 
 * HOW TO EXTEND:
 * 1. Add new query endpoints for specific analysis needs
 * 2. Use prepared statements for all database queries (security)
 * 3. Consider adding indexes for frequently queried columns
 * 4. Archive old data to prevent database bloat (see archiveDb.js)
 */
import express from 'express';
import fs from 'fs/promises';
import { positionDb } from '../db/database.js';
import { paths } from '../config.js';

const router = express.Router();

// GET /positions/stats - Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = positionDb.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

// GET /positions/players - Get list of all tracked players
router.get('/players', async (req, res) => {
  try {
    const players = positionDb.getTrackedPlayers();
    res.json({ players, count: players.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tracked players', details: error.message });
  }
});

// GET /positions/latest - Get last known position of all players
router.get('/latest', async (req, res) => {
  try {
    const positions = positionDb.getAllPlayersLastPosition();
    res.json({ positions, count: positions.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get latest positions', details: error.message });
  }
});

// GET /positions/:playerId - Get position history for a specific player
router.get('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const positions = positionDb.getPlayerPositions(playerId, limit);
    res.json({ playerId, positions, count: positions.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get player positions', details: error.message });
  }
});

// GET /positions/:playerId/range - Get positions within a time range
router.get('/:playerId/range', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters required (unix timestamps)' });
    }
    
    const startTime = parseInt(start);
    const endTime = parseInt(end);
    
    if (isNaN(startTime) || isNaN(endTime)) {
      return res.status(400).json({ error: 'start and end must be valid unix timestamps' });
    }
    
    const positions = positionDb.getPlayerPositionsInRange(playerId, startTime, endTime);
    res.json({ 
      playerId, 
      positions, 
      count: positions.length,
      range: { start: startTime, end: endTime }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get player positions', details: error.message });
  }
});

// POST /positions/record - Manually record a position (for testing or manual entries)
router.post('/record', async (req, res) => {
  try {
    const { playerId, playerName, posX, posY, posZ, health, blood, isAlive, isUnconscious } = req.body;
    
    if (!playerId || posX === undefined || posY === undefined || posZ === undefined) {
      return res.status(400).json({ error: 'playerId, posX, posY, posZ are required' });
    }
    
    positionDb.recordPosition(playerId, playerName, posX, posY, posZ, health, blood, isAlive, isUnconscious);
    res.json({ success: true, message: 'Position recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record position', details: error.message });
  }
});

// POST /positions/snapshot - Capture current positions from online_players.json
router.post('/snapshot', async (req, res) => {
  try {
    // Read current online players
    const data = await fs.readFile(paths.onlinePlayers, 'utf-8');
    const onlineData = JSON.parse(data);
    
    if (!onlineData.players || onlineData.players.length === 0) {
      return res.json({ success: true, message: 'No players online to snapshot', count: 0 });
    }
    
    // Filter to only online players and prepare position data
    const positions = onlineData.players
      .filter(p => p.isOnline === 1 || p.isOnline === true)
      .map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        posX: p.posX || 0,
        posY: p.posY || 0,
        posZ: p.posZ || 0,
        health: p.health,
        blood: p.blood,
        isAlive: p.isAlive === 1 || p.isAlive === true,
        isUnconscious: p.isUnconscious === 1 || p.isUnconscious === true,
        recordedAt: onlineData.generatedAt || new Date().toISOString()
      }));
    
    if (positions.length > 0) {
      positionDb.recordPositionsBatch(positions);
    }
    
    res.json({ 
      success: true, 
      message: `Snapshot captured for ${positions.length} players`,
      count: positions.length,
      timestamp: onlineData.generatedAt
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({ success: false, message: 'No online players file found', count: 0 });
    }
    res.status(500).json({ error: 'Failed to capture snapshot', details: error.message });
  }
});

// DELETE /positions/cleanup - Delete old positions (default: older than 7 days)
router.delete('/cleanup', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    
    const result = positionDb.deleteOldPositions(cutoffTime);
    res.json({ 
      success: true, 
      message: `Deleted positions older than ${days} days`,
      deletedCount: result.changes
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cleanup old positions', details: error.message });
  }
});

export default router;
