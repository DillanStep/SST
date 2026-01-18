/**
 * @file userRoutes.js
 * @description User management API routes - CRUD operations for users
 * 
 * This module provides administrative user management functionality.
 * All routes require authentication, most require admin role.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET    /           - List all users (admin only)
 * - GET    /:id        - Get specific user details
 * - POST   /           - Create new user (admin only)
 * - PUT    /:id        - Update user (admin or self)
 * - DELETE /:id        - Delete user (admin only)
 * - PUT    /:id/password - Change password (admin or self)
 * - PUT    /:id/role   - Change user role (admin only)
 * 
 * ROLES:
 * - admin   - Full access to all features
 * - user    - Standard access, can manage own profile
 * - viewer  - Read-only access to dashboards
 * 
 * AUTHORIZATION:
 * - All routes require authentication (requireAuth middleware)
 * - Most routes require admin role (requireAdmin middleware)
 * - Users can update their own password and profile
 * 
 * AUDIT LOGGING:
 * All user management actions are logged to audit_log table.
 * 
 * HOW TO EXTEND:
 * 1. Add new user fields (email, display name, etc.)
 * 2. Add role-based permissions for specific features
 * 3. Add user invitation/registration flow
 * 4. Add user activity tracking
 */
import { Router } from "express";
import { userOps, auditOps } from "./authDb.js";
import { requireAuth, requireAdmin } from "./authMiddleware.js";

const router = Router();

// All user management routes require authentication
router.use(requireAuth);

// Get all users (admin only)
router.get("/", requireAdmin, (req, res) => {
  try {
    const users = userOps.getAll();
    res.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Get single user (admin only)
router.get("/:id", requireAdmin, (req, res) => {
  try {
    const user = userOps.getById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Create user (admin only)
router.post("/", requireAdmin, (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    // Check username doesn't exist
    const existing = userOps.getByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Validate role
    const validRoles = ["admin", "manager", "viewer"];
    const userRole = validRoles.includes(role) ? role : "viewer";
    
    const userId = userOps.create(username, password, userRole);
    
    auditOps.log(req.user.id, "USER_CREATED", `Created user: ${username} (${userRole})`, req.ip);
    
    res.status(201).json({ 
      success: true, 
      user: { id: userId, username, role: userRole }
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user (admin only)
router.put("/:id", requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, role, is_active } = req.body;
    
    const user = userOps.getById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Don't allow deactivating yourself
    if (userId === req.user.id && is_active === false) {
      return res.status(400).json({ error: "Cannot deactivate your own account" });
    }
    
    // Don't allow removing admin from yourself
    if (userId === req.user.id && role && role !== "admin") {
      return res.status(400).json({ error: "Cannot remove admin role from yourself" });
    }
    
    const updates = {};
    if (username) updates.username = username;
    if (role && ["admin", "manager", "viewer"].includes(role)) updates.role = role;
    if (typeof is_active === "boolean") updates.is_active = is_active ? 1 : 0;
    
    const success = userOps.update(userId, updates);
    
    if (success) {
      auditOps.log(req.user.id, "USER_UPDATED", `Updated user: ${user.username} -> ${JSON.stringify(updates)}`, req.ip);
    }
    
    res.json({ success, user: userOps.getById(userId) });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Reset user password (admin only)
router.post("/:id/reset-password", requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    const user = userOps.getById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    userOps.updatePassword(userId, newPassword);
    
    auditOps.log(req.user.id, "PASSWORD_RESET", `Reset password for: ${user.username}`, req.ip);
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Delete user (admin only)
router.delete("/:id", requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Don't allow deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    
    const user = userOps.getById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    userOps.delete(userId);
    
    auditOps.log(req.user.id, "USER_DELETED", `Deleted user: ${user.username}`, req.ip);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get audit log (admin only)
router.get("/audit/log", requireAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = auditOps.getRecent(limit);
    res.json({ logs });
  } catch (err) {
    console.error("Get audit log error:", err);
    res.status(500).json({ error: "Failed to get audit log" });
  }
});

export default router;
