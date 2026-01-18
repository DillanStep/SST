import crypto from "crypto";

// Generate a random API key if not set in .env
const generateApiKey = () => crypto.randomBytes(32).toString("hex");

// Get API key from environment or generate one
let API_KEY = process.env.API_KEY;

if (!API_KEY) {
  API_KEY = generateApiKey();
  console.log("═".repeat(60));
  console.log("🔐 NO API_KEY IN .env - GENERATED NEW KEY:");
  console.log(`   ${API_KEY}`);
  console.log("   Add this to your .env file: API_KEY=" + API_KEY);
  console.log("═".repeat(60));
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
