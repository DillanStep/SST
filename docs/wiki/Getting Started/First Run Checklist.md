# First Run Checklist

Use this after you’ve installed and configured SST.

## DayZ server + mod

- `$profile:SST/` folder is created
- `$profile:SST/api/` folder is created
- Inventory exports appear in `$profile:SST/inventories/`
- Event logs appear in `$profile:SST/events/` and `$profile:SST/life_events/`

## Node API

- `GET /health` returns OK
- You can log in via `POST /auth/login`
- API key is set (or was generated and saved into `.env`)
- `GET /online` and `GET /dashboard` return JSON

## Dashboard

- Dashboard can log in
- Player list populates
- Inventory view loads a selected player

## If something fails

- [Troubleshooting](../Help/Troubleshooting.md)
