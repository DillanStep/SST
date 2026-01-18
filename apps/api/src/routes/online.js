/**
 * @file online.js
 * @description Online player tracking and real-time status monitoring
 * 
 * This module provides real-time data about currently connected players.
 * It reads from the mod's player data JSON file which is updated live.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET /          - List all online players with details
 * - GET /count     - Get just the player count
 * - GET /:id       - Get specific player details
 * 
 * DATA SOURCE:
 * Reads from: {SST_PATH}/SST/player_tracker.json
 * Updated by: DayZ mod on player connect/disconnect/update
 * 
 * PLAYER DATA STRUCTURE:
 * {
 *   "playerId": "Steam64 ID",
 *   "name": "Player Name",
 *   "position": { "x": 0, "y": 0, "z": 0 },
 *   "health": 100,
 *   "blood": 5000,
 *   "isAlive": true,
 *   "lastUpdate": "ISO timestamp"
 * }
 * 
 * TRANSFORM FUNCTION:
 * transformPlayer() normalizes the data format between mod versions
 * and ensures consistent output regardless of mod updates.
 * 
 * HOW TO EXTEND:
 * 1. Add additional player stats as the mod exposes them
 * 2. Consider caching for high-traffic servers
 * 3. Add WebSocket support for real-time push updates
 */
import express from 'express';
import fs from 'fs/promises';
import { paths } from '../config.js';

const router = express.Router();

// Helper function to transform player data to expected format
function transformPlayer(p) {
  return {
    playerId: p.playerId,
    playerName: p.playerName,
    biId: p.biId,
    isOnline: p.isOnline === 1 || p.isOnline === true,
    connectedAt: p.connectedAt,
    lastUpdate: p.lastUpdate,
    position: {
      x: p.posX || 0,
      y: p.posY || 0,
      z: p.posZ || 0
    },
    health: p.health || 0,
    blood: p.blood || 0,
    water: p.water || 0,
    energy: p.energy || 0,
    isAlive: p.isAlive === 1 || p.isAlive === true,
    isUnconscious: p.isUnconscious === 1 || p.isUnconscious === true
  };
}

// Helper function to read online players file
async function getOnlinePlayers() {
  try {
    const data = await fs.readFile(paths.onlinePlayers, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { generatedAt: null, onlineCount: 0, players: [] };
    }
    throw error;
  }
}

// GET /online - Get all players (online and offline)
router.get('/', async (req, res) => {
  try {
    const data = await getOnlinePlayers();
    res.json({
      generatedAt: data.generatedAt,
      onlineCount: data.onlineCount,
      players: (data.players || []).map(transformPlayer)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read online players', details: error.message });
  }
});

// GET /online/active - Get only currently online players
router.get('/active', async (req, res) => {
  try {
    const data = await getOnlinePlayers();
    const activePlayers = (data.players || [])
      .filter(p => p.isOnline === 1 || p.isOnline === true)
      .map(transformPlayer);
    res.json({
      generatedAt: data.generatedAt,
      onlineCount: activePlayers.length,
      players: activePlayers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read online players', details: error.message });
  }
});

// GET /online/:playerId - Get specific player's online status and location
router.get('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const data = await getOnlinePlayers();
    
    const player = (data.players || []).find(p => p.playerId === playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found in tracking data' });
    }
    
    res.json({
      generatedAt: data.generatedAt,
      player: transformPlayer(player)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read player data', details: error.message });
  }
});

// GET /online/locations/all - Get all online player locations (for map view)
router.get('/locations/all', async (req, res) => {
  try {
    const data = await getOnlinePlayers();
    const locations = (data.players || [])
      .filter(p => p.isOnline === 1 || p.isOnline === true)
      .map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        x: p.posX || 0,
        y: p.posY || 0,
        z: p.posZ || 0,
        health: p.health || 0,
        isAlive: p.isAlive === 1 || p.isAlive === true,
        lastUpdate: p.lastUpdate
      }));
    
    res.json({
      timestamp: data.generatedAt,
      onlineCount: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read player locations', details: error.message });
  }
});

export default router;
