/**
 * =============================================================================
 * SST Node API - Configuration
 * =============================================================================
 * 
 * @file        config.js
 * @description Central configuration file that loads all paths from environment
 *              variables. All file paths used by the API are defined here.
 * 
 * @author      SUDO Gaming
 * @license     Non-Commercial (see LICENSE file)
 * @version     1.0.0
 * @lastUpdated 2026-01-17
 * 
 * WHAT THIS FILE DOES:
 * - Loads environment variables from .env file
 * - Exports `paths` object with all configured directories
 * - Provides `logConfig()` function to print current configuration
 * 
 * HOW TO ADD NEW PATHS:
 * 1. Add a new entry to the `paths` object below
 * 2. Use process.env.YOUR_VAR || defaultValue pattern
 * 3. Document the new variable in .env.example
 * 
 * IMPORTANT:
 * - Users MUST configure SST_PATH in .env for the API to work
 * - All paths should use forward slashes (/) even on Windows
 * - Paths are resolved relative to the DayZ server installation
 * 
 * =============================================================================
 */

import "dotenv/config";

// Default base paths - MUST be configured in .env for your server
// These defaults will NOT work - you must set SST_PATH in your .env file
const defaultBasePath = process.env.SST_PATH || "./profiles/SST";
const defaultExpansionPath = process.env.EXPANSION_TRADERS_PATH?.replace(/\/Traders$/, "") || "./profiles/ExpansionMod";
const defaultMissionPath = process.env.MISSION_PATH || "./mpmissions/dayzOffline.chernarusplus";
const defaultProfilesPath = process.env.PROFILES_PATH || "./profiles";

// .env values take priority, then fall back to defaults
export const paths = {
  // SST base path
  sst: process.env.SST_PATH || defaultBasePath,
  
  // SST paths
  inventories: process.env.INVENTORIES_PATH || `${defaultBasePath}/inventories`,
  events: process.env.EVENTS_PATH || `${defaultBasePath}/events`,
  lifeEvents: process.env.LIFE_EVENTS_PATH || `${defaultBasePath}/life_events`,
  trades: process.env.TRADES_PATH || `${defaultBasePath}/trades`,
  api: process.env.API_PATH || `${defaultBasePath}/api`,
  onlinePlayers: process.env.ONLINE_PLAYERS_PATH || (process.env.API_PATH ? `${process.env.API_PATH}/online_players.json` : `${defaultBasePath}/api/online_players.json`),
  
  // Expansion paths
  expansionTraders: process.env.EXPANSION_TRADERS_PATH || `${defaultExpansionPath}/Traders`,
  expansionMarket: process.env.EXPANSION_MARKET_PATH || `${defaultExpansionPath}/Market`,
  
  // Mission path (for trader zones and types.xml)
  missionFolder: process.env.MISSION_PATH || defaultMissionPath,
  
  // Types.xml path - can override if not in standard db/ folder
  // If not set, will look in MISSION_PATH/db/types.xml
  typesXml: process.env.TYPES_PATH || null,
  
  // Server profiles path (for logs)
  profiles: process.env.PROFILES_PATH || defaultProfilesPath,
  
  // SQLite database for position tracking
  database: process.env.DATABASE_PATH || `${defaultBasePath}/data/sst_tracking.db`
};

// Log configuration on startup (helpful for debugging)
export function logConfig() {
  console.log('[Config] Paths configured:');
  console.log(`  - Inventories: ${paths.inventories}`);
  console.log(`  - Events: ${paths.events}`);
  console.log(`  - Life Events: ${paths.lifeEvents}`);
  console.log(`  - Trades: ${paths.trades}`);
  console.log(`  - API: ${paths.api}`);
  console.log(`  - Mission: ${paths.missionFolder}`);
  console.log(`  - Types.xml: ${paths.typesXml || paths.missionFolder + '/db/types.xml'}`);
  console.log(`  - Expansion Traders: ${paths.expansionTraders}`);
  console.log(`  - Expansion Market: ${paths.expansionMarket}`);
  console.log(`  - Profiles: ${paths.profiles}`);
}

