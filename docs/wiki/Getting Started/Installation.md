# Installation

This is the high-level install flow. See Configuration next.

## 1) Install and enable the SST mod

- Build the mod PBOs as you normally would (Workbench/pboProject)
- Add the mod to your DayZ server startup parameters
- Verify server loads the mod without script errors

## 2) Start the Node API

From the repo root:

- API project lives under `apps/api/`

Typical flow:

- `npm install`
- configure `apps/api/.env`
- `npm start`

## 3) Start the web dashboard

From the repo root:

- Web project lives under `apps/web/`

Typical flow:

- `npm install`
- configure web `.env` if used
- `npm run dev` (local) or build for production

## Next

- [Configuration](Configuration.md)
- [First Run Checklist](First%20Run%20Checklist.md)
