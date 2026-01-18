# Players

This page describes the Players view in the dashboard.

## What it shows

- Online status and player identity (Steam64)
- Health/blood/water/energy (if exported)
- Last known location (if position tracking is enabled)

## Backing API endpoints

- `GET /online`
- `GET /online/:playerId`
- `GET /positions/:playerId` (if position tracking is enabled)
