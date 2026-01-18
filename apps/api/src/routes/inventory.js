/**
 * @file inventory.js
 * @description Player inventory management - View and delete items
 * 
 * This module provides read access to player inventories and the ability
 * to queue item deletions that the mod will execute.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET    /:playerId              - Get player's current inventory
 * - DELETE /:playerId/item/:itemId - Queue item for deletion
 * - GET    /delete-results         - Get deletion execution results
 * 
 * DATA FILES:
 * - item_deletes.json          - Queue of items to delete (mod polls this)
 * - item_deletes_results.json  - Results from mod after deletion
 * - {playerId}_inventory.json  - Current player inventory state
 * 
 * DELETION WORKFLOW:
 * 1. Dashboard sends DELETE request with player/item IDs
 * 2. API adds to item_deletes.json queue
 * 3. DayZ mod polls file and deletes item from player
 * 4. Mod writes result to item_deletes_results.json
 * 5. Dashboard can check results endpoint
 * 
 * HOW TO EXTEND:
 * 1. Add bulk delete operations
 * 2. Add item moving between players
 * 3. Add inventory search across all players
 */
import { Router } from "express";
import { readFile, writeFile } from "../storage/fs.js";
import { paths } from "../config.js";

const router = Router();
const deleteQueueFile = `${paths.api}/item_deletes.json`;
const deleteResultsFile = `${paths.api}/item_deletes_results.json`;

router.get("/:playerId", async (req, res) => {
  try {
    const file = `${paths.inventories}/${req.params.playerId}.json`;
    const json = JSON.parse(await readFile(file, "utf8"));
    res.json(json);
  } catch {
    res.status(404).json({ error: "Inventory not found" });
  }
});

// Delete item from player inventory
router.delete("/:playerId/item", async (req, res) => {
  try {
    const { itemClassName, itemPath, deleteCount = 0 } = req.body;
    
    if (!itemClassName) {
      return res.status(400).json({ error: "itemClassName is required" });
    }
    
    if (!itemPath) {
      return res.status(400).json({ error: "itemPath is required" });
    }
    
    const request = {
      requestId: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId: req.params.playerId,
      itemClassName,
      itemPath,
      deleteCount: parseInt(deleteCount) || 0,
      requestedAt: new Date().toISOString(),
      processed: false,
      status: "pending",
      result: ""
    };
    
    // Load existing queue or create new
    let queue = { requests: [] };
    try {
      queue = JSON.parse(await readFile(deleteQueueFile, "utf8"));
      if (!queue.requests) queue.requests = [];
    } catch {}
    
    queue.requests.push(request);
    await writeFile(deleteQueueFile, JSON.stringify(queue, null, 2));
    
    res.json({
      status: "queued",
      message: "Item deletion request queued. It will be processed when the player is online.",
      request
    });
  } catch (err) {
    console.error("Error queuing item deletion:", err);
    res.status(500).json({ error: "Failed to queue item deletion" });
  }
});

// Get delete results
router.get("/delete-results/all", async (req, res) => {
  try {
    const results = JSON.parse(await readFile(deleteResultsFile, "utf8"));
    res.json(results);
  } catch {
    res.json({ requests: [] });
  }
});

export default router;
