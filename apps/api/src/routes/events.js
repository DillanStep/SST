/**
 * @file events.js
 * @description Player event log retrieval - Game events by player ID
 * 
 * This module retrieves player-specific event logs that the DayZ mod records.
 * Events include kills, deaths, item pickups, and other significant actions.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET /:playerId     - Get all events for a specific player
 * 
 * DATA FILES:
 * Location: {EVENTS_PATH}/{playerId}_events.json
 * 
 * EVENT TYPES:
 * - KILL      - Player killed another player
 * - DEATH     - Player died
 * - ITEM      - Significant item interaction
 * - ZONE      - Entered/exited specific zone
 * 
 * HOW TO EXTEND:
 * 1. Add filtering by event type
 * 2. Add date range queries
 * 3. Add pagination for players with many events
 */
import { Router } from "express";
import { readFile } from "../storage/fs.js";
import { paths } from "../config.js";

const router = Router();

router.get("/:playerId", async (req, res) => {
  try {
    const file = `${paths.events}/${req.params.playerId}_events.json`;
    const json = JSON.parse(await readFile(file, "utf8"));
    res.json(json);
  } catch {
    res.status(404).json({ error: "Events not found" });
  }
});

export default router;
