/**
 * =============================================================================
 * SST Node API - Item Grant Routes
 * =============================================================================
 * 
 * @file        routes/grants.js
 * @description Handles item granting requests. Creates queue files that the
 *              SST mod processes to give items to players in-game.
 * 
 * @author      SUDO Gaming
 * @license     Non-Commercial (see LICENSE file)
 * @version     1.0.0
 * @lastUpdated 2026-01-17
 * 
 * ENDPOINTS:
 * - POST /grants         - Queue an item grant for a player
 * - GET  /grants/results - Get results of processed grants
 * 
 * DATA FILES:
 * - API_PATH/item_grants.json        - Queue of pending grants
 * - API_PATH/item_grants_results.json - Processed grant results
 * 
 * WORKFLOW:
 * 1. Dashboard calls POST /grants with playerId and item details
 * 2. Grant is written to item_grants.json with processed=false
 * 3. SST mod reads queue, gives item to player, sets processed=true
 * 4. Dashboard polls /results to show success/failure
 * 
 * =============================================================================
 */

import { Router } from "express";
import { readFile, writeFile } from "fs/promises";
import { paths } from "../config.js";

const router = Router();
const grantFile = `${paths.api}/item_grants.json`;

router.post("/", async (req, res) => {
  const grant = {
    playerId: req.body.playerId,
    itemClassName: req.body.itemClassName,
    quantity: req.body.quantity ?? 1,
    health: req.body.health ?? 100,
    processed: false,
    result: ""
  };

  let data = { requests: [] };
  try {
    data = JSON.parse(await readFile(grantFile, "utf8"));
    if (!data.requests) data.requests = [];
  } catch {}

  data.requests.push(grant);
  await writeFile(grantFile, JSON.stringify(data, null, 2));

  res.json({ status: "QUEUED", grant });
});

router.get("/results", async (_, res) => {
  try {
    const results = JSON.parse(
      await readFile(`${paths.api}/item_grants_results.json`, "utf8")
    );
    res.json(results);
  } catch {
    res.status(404).json({ error: "No results yet" });
  }
});

export default router;
