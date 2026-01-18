# Configuration

SST has three configuration surfaces:

1. DayZ server profile paths (where JSON is written)
2. Node API `.env` paths (where JSON is read/written)
3. Web dashboard API URL

## Node API (.env)

The Node API must be pointed at the DayZ profile folder containing `SST/`.

Key settings:

- `PORT`, `HOST`
- `JWT_SECRET`
- `API_KEY`
- `DAYZ_PROFILE_PATH` and/or `SST_PATH` depending on your setup

See `apps/api/.env.example` for the authoritative list.

## CORS

If running the dashboard on a different origin, configure:

- `CORS_ORIGIN`

## Next

- [First Run Checklist](First%20Run%20Checklist.md)
