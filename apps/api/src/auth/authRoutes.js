/**
 * @file authRoutes.js
 * @description Authentication API routes - Login, logout, session management
 * 
 * This module handles user authentication including login, logout,
 * token refresh, and session management.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - POST /login       - Authenticate user, return JWT token
 * - POST /logout      - Invalidate current session
 * - POST /refresh     - Refresh JWT token
 * - GET  /me          - Get current user info
 * - GET  /sessions    - List active sessions (admin)
 * - DELETE /sessions/:id - Revoke specific session (admin)
 * 
 * AUTHENTICATION FLOW:
 * 1. Client sends username/password to /login
 * 2. Server validates credentials against database
 * 3. Server creates session and returns JWT token
 * 4. Client includes token in Authorization header
 * 5. Token expires after SESSION_DURATION (24 hours default)
 * 
 * SECURITY FEATURES:
 * - Passwords hashed with bcrypt
 * - Sessions stored in database (can be revoked)
 * - Audit log of all auth events
 * - Rate limiting recommended for production
 * 
 * ENVIRONMENT VARIABLES:
 * - JWT_SECRET: Secret key for signing tokens (REQUIRED in production)
 * 
 * HOW TO EXTEND:
 * 1. Add OAuth/SSO integration
 * 2. Add two-factor authentication
 * 3. Add password reset flow
 * 4. Add email verification
 */
import { Router } from "express";
import jwt from "jsonwebtoken";
import { userOps, sessionOps, auditOps } from "./authDb.js";

const router = Router();

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "sst-dashboard-secret-key-change-in-production";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Login
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    
    const user = userOps.verifyPassword(username, password);
    
    if (!user) {
      auditOps.log(null, "LOGIN_FAILED", `Failed login attempt for: ${username}`, req.ip);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    // Store session
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
    sessionOps.create(user.id, token, expiresAt, req.ip, req.get("User-Agent"));
    
    // Log successful login
    auditOps.log(user.id, "LOGIN_SUCCESS", null, req.ip);
    
    // Set HTTP-only cookie (for same-origin requests)
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: SESSION_DURATION
    });
    
    // Return token in response body for cross-origin requests
    res.json({
      success: true,
      token, // Include token for Bearer auth
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    
    if (token) {
      const session = sessionOps.getByToken(token);
      if (session) {
        auditOps.log(session.user_id, "LOGOUT", null, req.ip);
      }
      sessionOps.delete(token);
    }
    
    res.clearCookie("auth_token");
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Check session / get current user
router.get("/me", (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      res.clearCookie("auth_token");
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    // Check session exists and user is active
    const session = sessionOps.getByToken(token);
    if (!session || !session.is_active) {
      res.clearCookie("auth_token");
      return res.status(401).json({ error: "Session expired or user inactive" });
    }
    
    res.json({
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (err) {
    console.error("Auth check error:", err);
    res.status(500).json({ error: "Auth check failed" });
  }
});

// Change password (for current user)
router.post("/change-password", (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    // Verify current password
    const user = userOps.getByUsername(decoded.username);
    const verified = userOps.verifyPassword(decoded.username, currentPassword);
    
    if (!verified) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    
    // Update password
    userOps.updatePassword(user.id, newPassword);
    
    // Invalidate all other sessions
    sessionOps.deleteAllForUser(user.id);
    
    // Create new session
    const newToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
    sessionOps.create(user.id, newToken, expiresAt, req.ip, req.get("User-Agent"));
    
    res.cookie("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_DURATION
    });
    
    auditOps.log(user.id, "PASSWORD_CHANGED", null, req.ip);
    
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;
export { JWT_SECRET };
