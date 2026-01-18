/**
 * @file life-events.js
 * @description Player life cycle events - Spawns, deaths, and character history
 * 
 * This module tracks the lifecycle of player characters from spawn to death.
 * Each life is a separate entry showing duration, cause of death, and statistics.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET /:playerId       - Get life event history for a player
 * - GET /:playerId/stats - Get aggregated life statistics
 * - GET /recent          - Get recent deaths across all players
 * 
 * DATA FILES:
 * Location: {LIFE_EVENTS_PATH}/{playerId}_life.json
 * 
 * LIFE EVENT STRUCTURE:
 * {
 *   "lifeId": "unique-id",
 *   "spawnTime": "ISO timestamp",
 *   "deathTime": "ISO timestamp or null",
 *   "duration": "seconds alive",
 *   "causeOfDeath": "description",
 *   "killedBy": "playerId or null",
 *   "position": { "x": 0, "y": 0, "z": 0 }
 * }
 * 
 * STATISTICS AVAILABLE:
 * - Average life duration
 * - Most common cause of death
 * - Kill/death ratio
 * - Longest life achieved
 * 
 * HOW TO EXTEND:
 * 1. Add leaderboards for longest lives
 * 2. Add death heatmap integration
 * 3. Add kill feed endpoint for recent PvP
 */
import { Router } from "express";
import { readFile, readdir } from "../storage/fs.js";
import { paths } from "../config.js";

const router = Router();

// GET /life-events/:playerId - get life events for a player
router.get("/:playerId", async (req, res) => {
  try {
    const file = `${paths.lifeEvents}/${req.params.playerId}_life.json`;
    const json = JSON.parse(await readFile(file, "utf8"));
    res.json(json);
  } catch {
    res.status(404).json({ error: "Life events not found" });
  }
});

// GET /life-events - get all players' life events
router.get("/", async (req, res) => {
  try {
    const files = await readdir(paths.lifeEvents);
    const lifeFiles = files.filter(f => f.endsWith("_life.json"));
    
    const allEvents = [];
    
    for (const file of lifeFiles) {
      try {
        const data = JSON.parse(await readFile(`${paths.lifeEvents}/${file}`, "utf8"));
        if (data.events) {
          allEvents.push(...data.events);
        }
      } catch {}
    }

    // Sort by timestamp descending (newest first)
    allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply filters
    let results = allEvents;

    // Filter by event type
    if (req.query.type) {
      const type = req.query.type.toUpperCase();
      results = results.filter(e => e.eventType === type);
    }

    // Filter by player ID
    if (req.query.playerId) {
      results = results.filter(e => e.playerId === req.query.playerId);
    }

    // Limit results (default 100)
    const limit = parseInt(req.query.limit) || 100;
    results = results.slice(0, limit);

    res.json({
      count: results.length,
      events: results
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load life events", details: err.message });
  }
});

// GET /life-events/deaths/recent - get recent deaths
router.get("/deaths/recent", async (req, res) => {
  try {
    const files = await readdir(paths.lifeEvents);
    const lifeFiles = files.filter(f => f.endsWith("_life.json"));
    
    const deaths = [];
    
    for (const file of lifeFiles) {
      try {
        const data = JSON.parse(await readFile(`${paths.lifeEvents}/${file}`, "utf8"));
        if (data.events) {
          deaths.push(...data.events.filter(e => e.eventType === "DIED"));
        }
      } catch {}
    }

    // Sort by timestamp descending
    deaths.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const limit = parseInt(req.query.limit) || 20;
    
    res.json({
      count: deaths.slice(0, limit).length,
      deaths: deaths.slice(0, limit)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load deaths", details: err.message });
  }
});

export default router;
