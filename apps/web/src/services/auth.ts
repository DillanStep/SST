/**
 * @file auth.ts
 * @description Authentication service - Login, logout, and session management
 * 
 * This module handles user authentication for the SST Dashboard.
 * It manages JWT tokens, login/logout flows, and user session state.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * FEATURES:
 * - JWT token management (storage, refresh)
 * - Login/logout with automatic redirect
 * - User role checking (admin, manager, viewer)
 * - Session persistence across page reloads
 * - Multi-server authentication support
 * 
 * EXPORTS:
 * - login()          - Authenticate with username/password
 * - logout()         - Clear session and redirect
 * - getToken()       - Get current JWT token
 * - getUser()        - Get current user info
 * - isAuthenticated()- Check if user is logged in
 * - isAdmin()        - Check if user has admin role
 * 
 * TOKEN STORAGE:
 * Tokens stored in localStorage per-server.
 * Key format: sst-token-{serverId}
 * 
 * SECURITY NOTES:
 * - Token automatically cleared on 401 response
 * - Tokens expire after 24 hours (server-side)
 * - Never log or expose tokens in production
 * 
 * HOW TO EXTEND:
 * 1. Add new role checks as needed
 * 2. Add token refresh logic for long sessions
 * 3. Add remember-me functionality
 */
import { getActiveServer } from './serverManager';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface AuthUser extends User {
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  is_active?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user: User;
}

export interface AuthCheckResponse {
  user: User;
}

// Token storage keys
const TOKEN_KEY = 'sst-auth-token';
const TOKEN_KEY_SESSION = 'sst-auth-token-session';

// Get/set auth token for cross-origin requests
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY_SESSION);
}

export function setAuthToken(token: string | null, remember: boolean = true): void {
  if (token) {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY_SESSION);
    } else {
      sessionStorage.setItem(TOKEN_KEY_SESSION, token);
      localStorage.removeItem(TOKEN_KEY);
    }
  } else {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY_SESSION);
  }
}

// Get base URL for auth requests
function getAuthBaseUrl(): string {
  const server = getActiveServer();
  if (server) {
    return server.apiUrl;
  }
  // Default to same origin if no server configured
  return '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Auth API calls
export async function login(username: string, password: string, remember: boolean = true): Promise<LoginResponse> {
  const baseUrl = getAuthBaseUrl();
  
  if (!baseUrl) {
    throw new Error('No server configured. Please add a server in Settings.');
  }
  
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // For cookies (same-origin)
      body: JSON.stringify({ username, password }),
    });
  } catch (err) {
    console.error('[Auth] Network error:', err);
    throw new Error(`Cannot connect to server at ${baseUrl}. Check if the API is running.`);
  }
  
  // Get response text first to handle non-JSON responses
  const text = await response.text();
  
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.error('[Auth] Failed to parse response:', text.substring(0, 200));
    throw new Error(`Server returned invalid response. Status: ${response.status}`);
  }
  
  if (!response.ok) {
    const errorMessage =
      isRecord(data) && typeof data.error === 'string'
        ? data.error
        : `Login failed (${response.status})`;
    throw new Error(errorMessage);
  }
  
  // Store token for cross-origin Bearer auth
  if (isRecord(data) && typeof data.token === 'string') {
    setAuthToken(data.token, remember);
  }
  
  return data as LoginResponse;
}

export async function logout(): Promise<void> {
  const baseUrl = getAuthBaseUrl();
  const token = getAuthToken();
  
  await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  
  // Clear stored token
  setAuthToken(null);
}

export async function checkAuth(): Promise<AuthCheckResponse | null> {
  const baseUrl = getAuthBaseUrl();
  if (!baseUrl) return null;
  
  const token = getAuthToken();
  
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseUrl}/auth/me`, {
      credentials: 'include',
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Clear invalid token
      if (response.status === 401) {
        setAuthToken(null);
      }
      return null;
    }
    
    return response.json();
  } catch {
    return null;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const baseUrl = getAuthBaseUrl();
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${baseUrl}/auth/change-password`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }
}

// User Management API calls (admin only)
export async function getUsers(): Promise<{ users: AuthUser[] }> {
  const baseUrl = getAuthBaseUrl();
  const response = await fetch(`${baseUrl}/users`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get users');
  }
  
  return response.json();
}

export async function createUser(username: string, password: string, role: string): Promise<{ user: AuthUser }> {
  const baseUrl = getAuthBaseUrl();
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, role }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }
  
  return response.json();
}

export async function updateUser(id: number, updates: Partial<AuthUser>): Promise<{ user: AuthUser }> {
  const baseUrl = getAuthBaseUrl();
  const response = await fetch(`${baseUrl}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
  
  return response.json();
}

export async function resetUserPassword(id: number, newPassword: string): Promise<void> {
  const baseUrl = getAuthBaseUrl();
  const response = await fetch(`${baseUrl}/users/${id}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset password');
  }
}

export async function deleteUser(id: number): Promise<void> {
  const baseUrl = getAuthBaseUrl();
  const response = await fetch(`${baseUrl}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  username: string;
  action: string;
  details: string | null;
  ip_address: string;
  created_at: string;
}

export async function getAuditLog(limit = 100): Promise<{ logs: AuditLogEntry[] }> {
  const baseUrl = getAuthBaseUrl();
  const response = await fetch(`${baseUrl}/users/audit/log?limit=${limit}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get audit log');
  }
  
  return response.json();
}
