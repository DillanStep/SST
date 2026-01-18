import crypto from "crypto";
import { resolveEnvPathForWrite as resolveEnvPathForWriteFromFs, upsertEnvVar } from "../utils/envFile.js";

// Generate a random API key if not set in .env
const generateApiKey = () => crypto.randomBytes(32).toString("hex");

// Get API key from environment or generate one
let API_KEY = process.env.API_KEY;

let apiKeyGeneratedThisRun = false;
let apiKeyPersistedPath = null;

if (!API_KEY) {
  API_KEY = generateApiKey();
  apiKeyGeneratedThisRun = true;
  
  // Persist into .env so users don't lose it between restarts
  try {
    const envPath = resolveEnvPathForWriteFromFs();
    upsertEnvVar(envPath, "API_KEY", API_KEY);
    apiKeyPersistedPath = envPath;
  } catch {
    // If we can't write, the key still exists in memory for this run.
  }
}

// Middleware to validate API key
export function requireApiKey(req, res, next) {
  const providedKey = req.headers["x-api-key"] || req.query.apiKey;

  if (!providedKey) {
    return res.status(401).json({ 
      error: "Missing API key",
      hint: "Provide API key via 'x-api-key' header or 'apiKey' query parameter"
    });
  }

  if (providedKey !== API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}

// Optional: middleware that only warns if no API key (for development)
export function optionalApiKey(req, res, next) {
  const providedKey = req.headers["x-api-key"] || req.query.apiKey;

  if (providedKey && providedKey !== API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}

export function getApiKey() {
  return API_KEY;
}

export function getApiKeyMeta() {
  return {
    generated: apiKeyGeneratedThisRun,
    persistedPath: apiKeyPersistedPath,
  };
}
