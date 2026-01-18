import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { loadProviderConfig, selectProvider } from "./providerConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadDotEnv() {
  // Prefer explicit path override
  const explicitPath = process.env.SST_API_ENV_PATH
    ? path.resolve(process.env.SST_API_ENV_PATH)
    : null;

  const candidates = [
    explicitPath,
    // Common: started from apps/api
    path.resolve(process.cwd(), ".env"),
    // Robust: always try apps/api/.env (relative to this file)
    path.resolve(__dirname, "..", ".env")
  ].filter(Boolean);

  const chosen = candidates.find((p) => fs.existsSync(p));

  if (chosen) {
    dotenv.config({ path: chosen });
    if (process.env.DEBUG) {
      console.log(`[Config] Loaded environment from: ${chosen}`);
    }
    return;
  }

  // Fall back to default dotenv behavior (will look for .env in CWD)
  dotenv.config();
}

loadDotEnv();

function applyEnvObject(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const [key, rawValue] of Object.entries(obj)) {
    if (rawValue === undefined || rawValue === null) continue;

    // Don’t clobber explicit env vars
    if (process.env[key] !== undefined && process.env[key] !== "") continue;

    process.env[key] = typeof rawValue === "string" ? rawValue : String(rawValue);
  }
}

// Load provider config (optional) and overlay env from it.
// This lets users run with a single config file (host-providers.json)
// and keep .env only for local overrides if they want.
const providerConfig = loadProviderConfig();
const provider = selectProvider(providerConfig);

// Allow top-level env in config
applyEnvObject(providerConfig?.env);

// Allow per-provider env/paths overrides
applyEnvObject(provider?.env);
applyEnvObject(provider?.paths);

// If backend is specified in provider, apply it unless STORAGE_BACKEND is already set
if (provider?.backend && (process.env.STORAGE_BACKEND === undefined || process.env.STORAGE_BACKEND === "")) {
  process.env.STORAGE_BACKEND = String(provider.backend);
}
