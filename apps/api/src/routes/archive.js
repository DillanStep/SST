/**
 * @file archive.js
 * @description Position data archiving - Historical data management and cleanup
 * 
 * This module manages the archiving of position data from the main database
 * to a separate archive database. Helps maintain performance by moving
 * old data out of the active database.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET    /info         - Get archive database statistics
 * - POST   /run          - Trigger manual archive operation (Admin only)
 * - GET    /query        - Query archived position data
 * - DELETE /purge        - Purge old archive data (Admin only)
 * 
 * ARCHIVE WORKFLOW:
 * 1. Positions older than threshold moved to archive.db
 * 2. Original positions deleted from main positions.db
 * 3. Archive can be queried for historical analysis
 * 4. Old archives can be purged to reclaim disk space
 * 
 * DATABASE FILES:
 * - data/positions.db  - Active position data (recent)
 * - data/archive.db    - Archived position data (historical)
 * 
 * AUTHENTICATION:
 * Archive operations require admin authentication via requireAdmin middleware.
 * This prevents accidental data loss from unauthorized access.
 * 
 * HOW TO EXTEND:
 * 1. Add scheduled automatic archiving
 * 2. Add archive export to CSV/JSON
 * 3. Add archive restore functionality
 * 4. Add per-player archive queries
 */
import express from "express";
import { runArchive, archiveQueries, getArchiveDb } from "../db/archiveDb.js";
import { requireAdmin } from "../auth/authMiddleware.js";

const router = express.Router();

// Get archive info/stats
router.get("/info", async (req, res) => {
  try {
    const info = archiveQueries.getArchiveInfo();
    res.json(info);
  } catch (err) {
    console.error("Error getting archive info:", err);
    res.status(500).json({ error: "Failed to get archive info" });
  }
});

// Get archive run history
router.get("/runs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const runs = archiveQueries.getArchiveRuns(limit);
    res.json({ runs });
  } catch (err) {
    console.error("Error getting archive runs:", err);
    res.status(500).json({ error: "Failed to get archive runs" });
  }
});

// Trigger manual archive (admin only)
router.post("/run", requireAdmin, async (req, res) => {
  try {
    const clearFiles = req.body.clearFiles !== false; // Default to true
    console.log(`[Archive] Manual archive triggered by admin (clearFiles: ${clearFiles})`);
    
    const result = await runArchive(clearFiles);
    res.json(result);
  } catch (err) {
    console.error("Error running archive:", err);
    res.status(500).json({ error: "Failed to run archive" });
  }
});

// Prune old data (admin only)
router.post("/prune", requireAdmin, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.body.daysToKeep) || 90;
    console.log(`[Archive] Pruning data older than ${daysToKeep} days`);
    
    const result = archiveQueries.pruneOldData(daysToKeep);
    res.json({ 
      message: `Pruned records older than ${daysToKeep} days`,
      ...result 
    });
  } catch (err) {
    console.error("Error pruning archive:", err);
    res.status(500).json({ error: "Failed to prune archive" });
  }
});

// Get trade statistics
router.get("/trades/stats", async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const stats = archiveQueries.getTradeStats({ startDate, endDate, groupBy });
    res.json({ stats });
  } catch (err) {
    console.error("Error getting trade stats:", err);
    res.status(500).json({ error: "Failed to get trade stats" });
  }
});

// Get top traded items
router.get("/trades/top-items", async (req, res) => {
  try {
    const { limit, tradeType, startDate, endDate } = req.query;
    const items = archiveQueries.getTopItems({ 
      limit: parseInt(limit) || 20, 
      tradeType, 
      startDate, 
      endDate 
    });
    res.json({ items });
  } catch (err) {
    console.error("Error getting top items:", err);
    res.status(500).json({ error: "Failed to get top items" });
  }
});

// Get player's archived trades
router.get("/trades/player/:steamId", async (req, res) => {
  try {
    const { steamId } = req.params;
    const { limit, offset, startDate, endDate } = req.query;
    
    const trades = archiveQueries.getPlayerTrades(steamId, {
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0,
      startDate,
      endDate
    });
    
    res.json({ trades, steamId });
  } catch (err) {
    console.error("Error getting player trades:", err);
    res.status(500).json({ error: "Failed to get player trades" });
  }
});

// Get death statistics
router.get("/deaths/stats", async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const stats = archiveQueries.getDeathStats({ startDate, endDate, groupBy });
    res.json({ stats });
  } catch (err) {
    console.error("Error getting death stats:", err);
    res.status(500).json({ error: "Failed to get death stats" });
  }
});

// Get player's archived life events
router.get("/life-events/player/:steamId", async (req, res) => {
  try {
    const { steamId } = req.params;
    const { limit, offset, eventType } = req.query;
    
    const events = archiveQueries.getPlayerLifeEvents(steamId, {
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0,
      eventType
    });
    
    res.json({ events, steamId });
  } catch (err) {
    console.error("Error getting player life events:", err);
    res.status(500).json({ error: "Failed to get player life events" });
  }
});

export default router;
