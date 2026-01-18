# Vehicles

Vehicle support depends on Expansion Vehicles.

## What it shows

- Tracked vehicles (persistent id `A-B-C-D`)
- Owner, class, last known position
- Purchases and key history

## Backing API endpoints

- `GET /vehicles`
- `GET /vehicles/:vehicleId`
- `POST /vehicles/generate-key`
- `DELETE /vehicles/:vehicleId`
