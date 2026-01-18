/**
 * @file trades.js
 * @description Player trade history - Market transactions and player-to-player trades
 * 
 * This module retrieves trade history for players, including:
 * - Expansion Market purchases and sales
 * - Player-to-player trades (if tracked)
 * - Banking transactions
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET /:playerId   - Get trade history for a specific player
 * 
 * DATA FILES:
 * Location: {TRADES_PATH}/{playerId}_trades.json
 * 
 * TRADE STRUCTURE:
 * {
 *   "tradeId": "unique-id",
 *   "timestamp": "ISO timestamp",
 *   "type": "buy|sell|trade",
 *   "item": "classname",
 *   "quantity": 1,
 *   "price": 100,
 *   "trader": "trader name or playerId"
 * }
 * 
 * HOW TO EXTEND:
 * 1. Add aggregate trade statistics
 * 2. Add market trend analysis
 * 3. Add trade search across all players
 * 4. Add suspicious trade pattern detection
 */
import { Router } from "express";
import { readFile } from "../storage/fs.js";
import { paths } from "../config.js";

const router = Router();

// Get trades for a specific player
router.get("/:playerId", async (req, res) => {
  try {
    const file = `${paths.trades}/${req.params.playerId}_trades.json`;
    const json = JSON.parse(await readFile(file, "utf8"));
    res.json(json);
  } catch {
    res.status(404).json({ error: "Trades not found" });
  }
});

export default router;
