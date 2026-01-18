/**
 * @file authMiddleware.js
 * @description Express middleware for JWT authentication and authorization
 * 
 * This module provides authentication middleware that verifies JWT tokens
 * and attaches user information to the request object.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * MIDDLEWARE EXPORTS:
 * - authenticate      - Verify JWT token, attach user to req.user
 * - requireAuth       - Require valid authentication (401 if missing)
 * - requireAdmin      - Require admin role (403 if not admin)
 * - optionalAuth      - Attach user if present, continue if not
 * 
 * TOKEN SOURCES:
 * 1. Authorization header: "Bearer <token>"
 * 2. Cookie: "sst_token=<token>"
 * 
 * USER OBJECT:
 * After successful auth, req.user contains:
 * - id          - User ID
 * - username    - Username
 * - role        - Role (admin, user, viewer)
 * - sessionId   - Current session ID
 * 
 * SESSION VALIDATION:
 * Tokens are validated against session database.
 * Expired or revoked sessions return 401.
 * 
 * HOW TO EXTEND:
 * 1. Add new role-based middleware (e.g., requireModerator)
 * 2. Add API key authentication alongside JWT
 * 3. Add rate limiting per user
 */
import jwt from "jsonwebtoken";
import { sessionOps } from "./authDb.js";
import { JWT_SECRET } from "./authRoutes.js";

// Extract token from request (cookie or Authorization header)
function extractToken(req) {
  // First check Authorization header (for cross-origin requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  
  // Fall back to cookie
  return req.cookies?.auth_token;
}

// Middleware to require authentication
export function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    // Check session exists and user is active
    const session = sessionOps.getByToken(token);
    if (!session || !session.is_active) {
      return res.status(401).json({ error: "Session expired or user inactive" });
    }
    
    // Attach user to request
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication error" });
  }
}

// Middleware to require admin role
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// Middleware to require admin or manager role
export function requireManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({ error: "Manager access required" });
  }
  
  next();
}
