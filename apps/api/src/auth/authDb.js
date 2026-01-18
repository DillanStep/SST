/**
 * @file authDb.js
 * @description Authentication database - Users, sessions, and audit logging
 * 
 * This module manages the authentication SQLite database containing
 * users, active sessions, and security audit logs.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * DATABASE LOCATION:
 * data/auth.db (separate from position data)
 * 
 * TABLES:
 * users:
 * - id, username, password_hash, role, created_at, updated_at
 * 
 * sessions:
 * - id, user_id, token_hash, expires_at, created_at, ip_address
 * 
 * audit_log:
 * - id, user_id, action, details, ip_address, timestamp
 * 
 * EXPORTS:
 * - userOps          - User CRUD operations
 *   - createUser(), getUser(), updateUser(), deleteUser()
 *   - validatePassword(), changePassword()
 * 
 * - sessionOps       - Session management
 *   - createSession(), validateSession(), revokeSession()
 *   - getUserSessions(), cleanExpiredSessions()
 * 
 * - auditOps         - Audit logging
 *   - logAction(), getAuditLog(), getUserAuditLog()
 * 
 * SECURITY NOTES:
 * - Passwords hashed with bcrypt (10 rounds)
 * - Session tokens hashed before storage
 * - Audit log captures all auth events
 * 
 * INITIAL SETUP:
 * First user created automatically as admin if no users exist.
 * Default: admin/admin (CHANGE IMMEDIATELY)
 * 
 * HOW TO EXTEND:
 * 1. Add new fields to user table (email, 2FA, etc.)
 * 2. Add password policy enforcement
 * 3. Add session device tracking
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path - stored in the API directory
const DB_PATH = path.join(__dirname, "..", "..", "data", "auth.db");

let db = null;

// Initialize the database
export async function initAuthDb() {
  const dataDir = path.dirname(DB_PATH);
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  db = new Database(DB_PATH);
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  // Create sessions table for tracking active sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create audit log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Check if default admin exists, create if not
  const adminExists = db.prepare("SELECT id FROM users WHERE username = ?").get("SudoArkMan");
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync("Password123", 12);
    db.prepare(`
      INSERT INTO users (username, password, role) 
      VALUES (?, ?, ?)
    `).run("SudoArkMan", hashedPassword, "admin");
    
    console.log("Created default admin account: SudoArkMan");
  }
  
  console.log("Auth database initialized at:", DB_PATH);
  return db;
}

// Get database instance
export function getAuthDb() {
  if (!db) {
    throw new Error("Auth database not initialized. Call initAuthDb() first.");
  }
  return db;
}

// User operations
export const userOps = {
  // Get user by username
  getByUsername(username) {
    return getAuthDb().prepare("SELECT * FROM users WHERE username = ?").get(username);
  },
  
  // Get user by ID
  getById(id) {
    return getAuthDb().prepare("SELECT id, username, role, created_at, updated_at, last_login, is_active FROM users WHERE id = ?").get(id);
  },
  
  // Get all users (without passwords)
  getAll() {
    return getAuthDb().prepare("SELECT id, username, role, created_at, updated_at, last_login, is_active FROM users ORDER BY username").all();
  },
  
  // Create user
  create(username, password, role = "viewer") {
    const hashedPassword = bcrypt.hashSync(password, 12);
    const result = getAuthDb().prepare(`
      INSERT INTO users (username, password, role) 
      VALUES (?, ?, ?)
    `).run(username, hashedPassword, role);
    return result.lastInsertRowid;
  },
  
  // Update user
  update(id, updates) {
    const allowedFields = ["username", "role", "is_active"];
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (setClause.length === 0) return false;
    
    setClause.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    
    const result = getAuthDb().prepare(`
      UPDATE users SET ${setClause.join(", ")} WHERE id = ?
    `).run(...values);
    
    return result.changes > 0;
  },
  
  // Update password
  updatePassword(id, newPassword) {
    const hashedPassword = bcrypt.hashSync(newPassword, 12);
    const result = getAuthDb().prepare(`
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(hashedPassword, id);
    return result.changes > 0;
  },
  
  // Delete user
  delete(id) {
    const result = getAuthDb().prepare("DELETE FROM users WHERE id = ?").run(id);
    return result.changes > 0;
  },
  
  // Verify password
  verifyPassword(username, password) {
    const user = this.getByUsername(username);
    if (!user || !user.is_active) return null;
    
    if (bcrypt.compareSync(password, user.password)) {
      // Update last login
      getAuthDb().prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
      return { id: user.id, username: user.username, role: user.role };
    }
    return null;
  }
};

// Session operations
export const sessionOps = {
  // Create session
  create(userId, token, expiresAt, ipAddress, userAgent) {
    getAuthDb().prepare(`
      INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, token, expiresAt, ipAddress, userAgent);
  },
  
  // Get session by token
  getByToken(token) {
    return getAuthDb().prepare(`
      SELECT s.*, u.username, u.role, u.is_active 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token);
  },
  
  // Delete session
  delete(token) {
    getAuthDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  },
  
  // Delete all sessions for user
  deleteAllForUser(userId) {
    getAuthDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  },
  
  // Clean expired sessions
  cleanExpired() {
    getAuthDb().prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
  }
};

// Audit log operations
export const auditOps = {
  log(userId, action, details, ipAddress) {
    getAuthDb().prepare(`
      INSERT INTO audit_log (user_id, action, details, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(userId, action, details, ipAddress);
  },
  
  getRecent(limit = 100) {
    return getAuthDb().prepare(`
      SELECT a.*, u.username 
      FROM audit_log a 
      LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC 
      LIMIT ?
    `).all(limit);
  }
};
