# SST Public

SST is an open-source DayZ server management suite built around:

- A DayZ server mod (in-game integration)
- A Node.js REST API
- A web dashboard

The goal is simple: give server owners proper visibility and control without relying on paid panels or clunky tooling.

## Start here (Wiki)

The documentation lives in this repo under `docs/wiki/`:

- Wiki home: docs/wiki/index.md
- Getting Started: docs/wiki/Getting Started/index.md
- API docs: apps/api/docs/API.md
- Mod script docs: docs/mod/scripts/README.md

## Repo layout

- `SST/` — DayZ mod source (Enforce Script)
- `Missions/` — mission config bundles (SST.*)
- `apps/api/` — Node/Express API
- `apps/web/` — Vite/React dashboard
- `docs/` — wiki + mod script docs

## Quick start (dev)

API:

```bash
cd apps/api
npm install
npm run start
```

Dashboard:

```bash
cd apps/web
npm install
npm run dev
```

Environment variables:

- API: see `apps/api/.env.example`
- Web: see `apps/web/.env.example` and `apps/web/.env.docker`

## Workbench / P:\ drive

If you’re using DayZ Tools Workbench, this repo includes helpers for mapping to the workdrive.
See `SetupWorkdrive.bat` and the wiki’s Getting Started section.

## Branching

- `main` — stable / “release-ready”
- `develop` — active development

## License

See docs/wiki/Legal/License.md
