# Troubleshooting

## Dashboard shows "Unauthorized" / API calls return 401

- Confirm you are logged in (cookie-based session) or using an API key.
- If using an API key, send it as `X-API-Key` (or `?apiKey=...`).
- Check the API server logs for auth messages.

## API returns "Missing API key"

- Some endpoints require an API key even if the server is reachable.
- Send `X-API-Key: <your key>`.
- Confirm your config points the dashboard at the correct API URL.

## Nothing updates / data looks stale

- Check the DayZ server `$profile` folder for SST output.
- Confirm the API is pointed at the same `$profile` path it’s reading from.
- Verify file permissions allow the API process to read/write those folders.

## Command queue not executing

- Confirm the mod is running server-side.
- Check `$profile:SST/api/` (or your configured queue dir) for queued JSON.
- Ensure the mod is polling and writing results back.

## JSON performance is poor

- Large inventories and frequent polling can be expensive.
- See [JSON Performance Concerns](../JSON%20Performance%20Concerns.md) for mitigation ideas (batching, sampling, reduced frequency).

## Common environment issues

- Node version mismatch: use Node 18+ for API and dashboard tooling.
- Port blocked: allow the API/dashboard ports through firewall.
- CORS: make sure the API allows the dashboard origin.
