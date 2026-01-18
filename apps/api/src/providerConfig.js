import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDefaultProviderConfigPath() {
  return path.resolve(__dirname, "..", "config", "host-providers.json");
}

export function loadProviderConfig() {
  const explicitPath = process.env.SST_API_PROVIDER_CONFIG;
  const configPath = explicitPath
    ? path.resolve(explicitPath)
    : getDefaultProviderConfigPath();

  try {
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, "utf8");
    if (!raw || raw.trim() === "") return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    // Malformed config: ignore and fall back to env
    return null;
  }
}

export function selectProvider(config) {
  if (!config?.providers || typeof config.providers !== "object") return null;

  const name = process.env.HOST_PROVIDER || config.active;
  if (!name) return null;

  return config.providers[name] || null;
}
