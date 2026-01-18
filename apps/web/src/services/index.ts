/**
 * @file index.ts
 * @description Services barrel export
 * 
 * Re-exports all service modules for convenient importing.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2026-01-17
 * 
 * SERVICES:
 * - api           - Backend API client
 * - serverManager - Multi-server configuration
 * - auth          - Authentication (exported separately)
 * - cache         - IndexedDB caching for API responses
 */
export * from './api';
export * from './serverManager';
export * from './cache';
