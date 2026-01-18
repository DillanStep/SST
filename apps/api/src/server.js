/**
 * =============================================================================
 * SST Node API - Main Server Entry Point
 * =============================================================================
 * 
 * @file        server.js
 * @description Main Express server that handles all API requests for the SST
 *              dashboard. This is the entry point for the entire API.
 * 
 * @author      SUDO Gaming
 * @license     Non-Commercial (see LICENSE file)
 * @version     1.0.0
 * @lastUpdated 2026-01-17
 * 
 * WHAT THIS FILE DOES:
 * - Initializes Express server with CORS and authentication
 * - Mounts all API route handlers
 * - Sets up position tracking interval
 * - Initializes SQLite databases for auth and archiving
 * 
 * HOW TO EXTEND:
 * 1. Create a new route file in ./routes/ (e.g., myfeature.js)
 * 2. Import it at the top of this file
 * 3. Mount it with: app.use("/myfeature", requireAuth, requireApiKey, myRoutes)
 * 4. Add corresponding API methods in dashboard's api.ts
 * 
 * CONFIGURATION:
 * - All paths configured via .env file (see .env.example)
 * - Port defaults to 3001 (set PORT in .env to change)
 * - API key auto-generates if not set in .env
 * 
 * =============================================================================
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs/promises";

import { requireApiKey, getApiKey } from "./middleware/auth.js";
import { positionDb } from "./db/database.js";
import { initArchiveDb, scheduleArchive } from "./db/archiveDb.js";
import { paths, logConfig } from "./config.js";
import { initAuthDb } from "./auth/authDb.js";
import { requireAuth, requireAdmin } from "./auth/authMiddleware.js";
import authRoutes from "./auth/authRoutes.js";
import userRoutes from "./auth/userRoutes.js";
import inventoryRoutes from "./routes/inventory.js";
import eventRoutes from "./routes/events.js";
import lifeEventRoutes from "./routes/life-events.js";
import tradeRoutes from "./routes/trades.js";
import economyRoutes from "./routes/economy.js";
import grantRoutes from "./routes/grants.js";
import dashboardRoutes from "./routes/dashboard.js";
import itemsRoutes from "./routes/items.js";
import onlineRoutes from "./routes/online.js";
import commandRoutes from "./routes/commands.js";
import expansionRoutes from "./routes/expansion.js";
import logsRoutes from "./routes/logs.js";
import positionsRoutes from "./routes/positions.js";
import archiveRoutes from "./routes/archive.js";
import vehiclesRoutes from "./routes/vehicles.js";

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0"; // Listen on all interfaces

// Configure CORS to allow requests from any origin (or specify your dashboard URL)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true, // Set CORS_ORIGIN in .env for production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  credentials: true, // Important for cookies
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check - no auth required
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Config check - admin only, shows configured paths
app.get("/config", requireAuth, requireAdmin, (req, res) => {
  res.json({
    paths: {
      inventories: paths.inventories,
      events: paths.events,
      lifeEvents: paths.lifeEvents,
      trades: paths.trades,
      api: paths.api,
      onlinePlayers: paths.onlinePlayers,
      expansionTraders: paths.expansionTraders,
      expansionMarket: paths.expansionMarket,
      missionFolder: paths.missionFolder,
      typesXml: paths.typesXml || `${paths.missionFolder}/db/types.xml`,
      profiles: paths.profiles,
      database: paths.database
    },
    server: {
      port: PORT,
      host: HOST
    }
  });
});

// Auth routes - no session required (login/logout)
app.use("/auth", authRoutes);

// User management routes - requires session auth
app.use("/users", userRoutes);

// All API routes require both session auth AND API key for extra security
// Session auth ensures user is logged into dashboard
// API key ensures the request is authorized for this server
app.use("/inventory", requireAuth, requireApiKey, inventoryRoutes);
app.use("/events", requireAuth, requireApiKey, eventRoutes);
app.use("/life-events", requireAuth, requireApiKey, lifeEventRoutes);
app.use("/trades", requireAuth, requireApiKey, tradeRoutes);
app.use("/economy", requireAuth, requireApiKey, economyRoutes);
app.use("/grants", requireAuth, requireApiKey, grantRoutes);
app.use("/dashboard", requireAuth, requireApiKey, dashboardRoutes);
app.use("/items", requireAuth, requireApiKey, itemsRoutes);
app.use("/online", requireAuth, requireApiKey, onlineRoutes);
app.use("/commands", requireAuth, requireApiKey, commandRoutes);
app.use("/expansion", requireAuth, requireApiKey, expansionRoutes);
app.use("/logs", requireAuth, requireApiKey, logsRoutes);
app.use("/positions", requireAuth, requireApiKey, positionsRoutes);
app.use("/archive", requireAuth, requireApiKey, archiveRoutes);
app.use("/vehicles", requireAuth, requireApiKey, vehiclesRoutes);

// Position tracking interval (capture player positions every 30 seconds)
const POSITION_TRACKING_INTERVAL = parseInt(process.env.POSITION_TRACKING_INTERVAL) || 30000;

async function capturePlayerPositions() {
  try {
    const data = await fs.readFile(paths.onlinePlayers, 'utf-8');
    const onlineData = JSON.parse(data);
    
    if (!onlineData.players || onlineData.players.length === 0) {
      return;
    }
    
    // Filter to only online players
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
      console.log(`[Position Tracker] Recorded ${positions.length} player positions`);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('[Position Tracker] Error:', error.message);
    }
  }
}

// Start position tracking
setInterval(capturePlayerPositions, POSITION_TRACKING_INTERVAL);

// Initialize auth database and start server
async function startServer() {
  try {
    // Log configuration
    logConfig();
    
    // Initialize auth database (creates tables and default admin if needed)
    await initAuthDb();
    
    // Initialize archive database
    initArchiveDb();
    
    // Schedule daily archive at 4:00 AM (configurable via env)
    const archiveHour = parseInt(process.env.ARCHIVE_HOUR) || 4;
    const archiveMinute = parseInt(process.env.ARCHIVE_MINUTE) || 0;
    scheduleArchive(archiveHour, archiveMinute);
    
    app.listen(PORT, HOST, () => {
      console.log(`SST Node API running on http://${HOST}:${PORT}`);
      console.log(`Position tracking enabled (every ${POSITION_TRACKING_INTERVAL / 1000}s)`);
      console.log(`Authentication enabled - login required`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
