/**
 * =============================================================================
 * SST Node API - Vehicle Management Routes
 * =============================================================================
 * 
 * @file        routes/vehicles.js
 * @description Handles all vehicle tracking, key generation, and deletion
 *              requests. Works with the SST mod's vehicle tracking system.
 * 
 * @author      SUDO Gaming
 * @license     Non-Commercial (see LICENSE file)
 * @version     1.0.0
 * @lastUpdated 2026-01-17
 * 
 * ENDPOINTS:
 * - GET  /vehicles              - List all tracked vehicles
 * - GET  /vehicles/:vehicleId   - Get specific vehicle details
 * - DELETE /vehicles/:vehicleId - Queue vehicle for deletion
 * - GET  /vehicles/positions/all - Get all vehicle positions for map
 * - GET  /vehicles/purchases/all - Get vehicle purchase history
 * - POST /vehicles/generate-key  - Generate replacement key for vehicle
 * - GET  /vehicles/key-results/all - Get key generation results
 * 
 * DATA FILES:
 * - SST_PATH/vehicles/tracked.json   - Currently tracked vehicles
 * - SST_PATH/vehicles/purchases.json - Purchase history
 * - API_PATH/key_grants.json         - Key generation queue
 * - API_PATH/vehicle_delete.json     - Vehicle deletion queue
 * 
 * HOW TO EXTEND:
 * 1. Add new route with router.get/post/delete()
 * 2. Use safeReadJson() for reading JSON files safely
 * 3. Update dashboard's api.ts with corresponding method
 * 
 * =============================================================================
 */

import express from "express";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { paths } from "../config.js";

const router = express.Router();

// Ensure directories exist (with error handling)
const ensureDirectories = async () => {
  try {
    const vehiclesDir = join(paths.sst, "vehicles");
    const apiDir = paths.api;
    
    if (!existsSync(vehiclesDir)) {
      await mkdir(vehiclesDir, { recursive: true });
    }
    if (!existsSync(apiDir)) {
      await mkdir(apiDir, { recursive: true });
    }
  } catch (err) {
    console.error(`[Vehicles] Error creating directories:`, err.message);
    // Don't throw - directories might already exist or we'll handle missing files later
  }
};

// Helper to safely read and parse JSON files
const safeReadJson = async (filePath, defaultValue = []) => {
  try {
    if (!existsSync(filePath)) {
      return defaultValue;
    }
    const content = await readFile(filePath, "utf8");
    if (!content || content.trim() === "") {
      return defaultValue;
    }
    return JSON.parse(content);
  } catch (err) {
    console.error(`[Vehicles] Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
};

// GET /vehicles - List all tracked vehicles
router.get("/", async (req, res) => {
  try {
    await ensureDirectories();
    
    const trackedFile = join(paths.sst, "vehicles", "tracked.json");
    const vehicles = await safeReadJson(trackedFile, []);
    
    // Ensure vehicles is an array
    const vehicleList = Array.isArray(vehicles) ? vehicles : [];
    
    // Optional filtering
    const { ownerId, className, destroyed } = req.query;
    
    let filtered = vehicleList;
    
    if (ownerId) {
      filtered = filtered.filter(v => v.ownerId === ownerId);
    }
    
    if (className) {
      filtered = filtered.filter(v => 
        v.vehicleClassName?.toLowerCase().includes(className.toLowerCase())
      );
    }
    
    if (destroyed !== undefined) {
      const isDestroyed = destroyed === 'true';
      // Handle both boolean and number (0/1) values for isDestroyed
      filtered = filtered.filter(v => {
        const vehicleDestroyed = v.isDestroyed === true || v.isDestroyed === 1;
        return vehicleDestroyed === isDestroyed;
      });
    }
    
    res.json({
      vehicles: filtered,
      count: filtered.length,
      totalTracked: vehicleList.length
    });
  } catch (err) {
    console.error(`[Vehicles] Error in GET /vehicles:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// IMPORTANT: Define specific routes BEFORE dynamic /:vehicleId route
// ============================================================================

// GET /vehicles/delete-results/all - Get vehicle deletion results
router.get("/delete-results/all", async (req, res) => {
  try {
    const resultsFile = join(paths.api, "vehicle_delete_results.json");
    const data = await safeReadJson(resultsFile, { requests: [] });
    
    res.json({
      results: data.requests || [],
      count: (data.requests || []).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /vehicles/purchases/all - List all vehicle purchases
router.get("/purchases/all", async (req, res) => {
  try {
    await ensureDirectories();
    
    const purchasesFile = join(paths.sst, "vehicles", "purchases.json");
    const purchases = await safeReadJson(purchasesFile, []);
    
    // Ensure purchases is an array
    const purchaseList = Array.isArray(purchases) ? purchases : [];
    
    // Optional filtering
    const { ownerId, className, limit } = req.query;
    
    let filtered = purchaseList;
    
    if (ownerId) {
      filtered = filtered.filter(p => p.ownerId === ownerId);
    }
    
    if (className) {
      filtered = filtered.filter(p => 
        p.vehicleClassName?.toLowerCase().includes(className.toLowerCase())
      );
    }
    
    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit));
    }
    
    res.json({
      purchases: filtered,
      count: filtered.length,
      totalPurchases: purchaseList.length
    });
  } catch (err) {
    console.error(`[Vehicles] Error in GET /vehicles/purchases/all:`, err);
    res.status(500).json({ error: err.message });
  }
});

// GET /vehicles/key-results/all - Get key generation results
router.get("/key-results/all", async (req, res) => {
  try {
    const resultsFile = join(paths.api, "key_grants_results.json");
    const data = await safeReadJson(resultsFile, { requests: [] });
    
    res.json({
      results: data.requests || [],
      count: (data.requests || []).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /vehicles/by-owner/:ownerId - Get all vehicles owned by a player
router.get("/by-owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const trackedFile = join(paths.sst, "vehicles", "tracked.json");
    const vehicles = await safeReadJson(trackedFile, []);
    
    const owned = vehicles.filter(v => v.ownerId === ownerId);
    
    res.json({
      ownerId,
      vehicles: owned,
      count: owned.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /vehicles/positions/all - Get all vehicle positions for map display
router.get("/positions/all", async (req, res) => {
  try {
    const trackedFile = join(paths.sst, "vehicles", "tracked.json");
    const vehicles = await safeReadJson(trackedFile, []);
    
    // Extract just position data for map display
    const positions = vehicles
      .filter(v => !v.isDestroyed)
      .map(v => ({
        vehicleId: v.vehicleId,
        className: v.vehicleClassName,
        displayName: v.vehicleDisplayName,
        position: v.lastPosition,
        lastUpdate: v.lastUpdateTime,
        ownerName: v.ownerName,
        ownerId: v.ownerId
      }));
    
    res.json({
      positions,
      count: positions.length,
      lastUpdate: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Dynamic routes MUST come after specific routes
// ============================================================================

// GET /vehicles/:vehicleId - Get specific vehicle details
router.get("/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const trackedFile = join(paths.sst, "vehicles", "tracked.json");
    const vehicles = await safeReadJson(trackedFile, []);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: "No vehicles tracked yet" });
    }
    
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /vehicles/:vehicleId - Queue vehicle for deletion in-game
router.delete("/:vehicleId", async (req, res) => {
  try {
    await ensureDirectories();
    
    const { vehicleId } = req.params;
    
    // Validate vehicleId format (should be A-B-C-D where values can be negative)
    const idMatch = vehicleId.match(/^(-?\d+)-(-?\d+)-(-?\d+)-(-?\d+)$/);
    if (!idMatch) {
      return res.status(400).json({ 
        error: "Invalid vehicleId format. Expected: A-B-C-D (four integers, can be negative)" 
      });
    }
    
    // Check if vehicle exists in tracked list
    const trackedFile = join(paths.sst, "vehicles", "tracked.json");
    let vehicleInfo = null;
    
    if (existsSync(trackedFile)) {
      const content = await readFile(trackedFile, "utf8");
      const vehicles = JSON.parse(content);
      vehicleInfo = vehicles.find(v => v.vehicleId === vehicleId);
    }
    
    if (!vehicleInfo) {
      return res.status(404).json({ error: "Vehicle not found in tracking list" });
    }
    
    // Create the deletion request
    const request = {
      requestId: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vehicleId,
      vehicleClassName: vehicleInfo.vehicleClassName,
      vehicleDisplayName: vehicleInfo.vehicleDisplayName,
      status: "pending",
      result: null,
      requestedAt: new Date().toISOString()
    };
    
    // Load existing queue or create new one
    const queueFile = join(paths.api, "vehicle_delete.json");
    let queue = { requests: [] };
    
    if (existsSync(queueFile)) {
      try {
        const content = await readFile(queueFile, "utf8");
        queue = JSON.parse(content);
      } catch {}
    }
    
    queue.requests.push(request);
    
    // Save queue
    await writeFile(queueFile, JSON.stringify(queue, null, 2), "utf8");
    
    console.log(`[Vehicles] Vehicle deletion queued: ${request.requestId} for ${vehicleId}`);
    
    res.json({
      status: "queued",
      message: "Vehicle deletion request queued. The vehicle will be destroyed when the server processes it.",
      requestId: request.requestId,
      vehicleId,
      vehicleDisplayName: vehicleInfo.vehicleDisplayName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /vehicles/generate-key - Queue a key generation request
router.post("/generate-key", async (req, res) => {
  try {
    await ensureDirectories();
    
    const { playerId, vehicleId, keyClassName, isMasterKey } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: "playerId is required" });
    }
    
    if (!vehicleId) {
      return res.status(400).json({ error: "vehicleId is required" });
    }
    
    // Validate vehicleId format (should be A-B-C-D where values can be negative)
    // Use regex to properly handle negative numbers: matches like "123-456-789--123" (last is -123)
    const idMatch = vehicleId.match(/^(-?\d+)-(-?\d+)-(-?\d+)-(-?\d+)$/);
    if (!idMatch) {
      return res.status(400).json({ 
        error: "Invalid vehicleId format. Expected: A-B-C-D (four integers, can be negative)" 
      });
    }
    
    // Check if vehicle exists in tracked list
    const trackedFile = join(paths.sst, "vehicles", "tracked.json");
    const vehicles = await safeReadJson(trackedFile, []);
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    
    if (!vehicle) {
      console.log(`[Vehicles] Warning: Vehicle ${vehicleId} not in tracked list`);
    }
    
    // Create the request
    const request = {
      requestId: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      vehicleId,
      keyClassName: keyClassName || "ExpansionCarKey",
      isMasterKey: isMasterKey || false,
      status: "pending",
      result: null
    };
    
    // Load existing queue or create new one
    const queueFile = join(paths.api, "key_grants.json");
    const queue = await safeReadJson(queueFile, { requests: [] });
    if (!queue.requests) queue.requests = [];
    
    queue.requests.push(request);
    
    // Save queue
    await writeFile(queueFile, JSON.stringify(queue, null, 2), "utf8");
    
    console.log(`[Vehicles] Key generation queued: ${request.requestId} for vehicle ${vehicleId}`);
    
    res.json({
      status: "queued",
      message: "Key generation request queued. The key will be created when the player is online.",
      requestId: request.requestId,
      vehicleId,
      playerId,
      keyClassName: request.keyClassName,
      isMasterKey: request.isMasterKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
