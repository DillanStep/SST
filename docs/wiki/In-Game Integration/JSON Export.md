# JSON Export

JSON export is the server → API direction.

## What gets exported

- Inventory snapshots
- Inventory event logs
- Life event logs
- Trade logs (Expansion Market)
- Vehicle tracking state (Expansion Vehicles)

## Primary exporter

Inventory exporting is implemented in:

- [docs/mod/scripts/SudoServerTools_Init.md](../../mod/scripts/SudoServerTools_Init.md)

DTOs are defined in:

- [docs/mod/scripts/SST_ATMExportManager.md](../../mod/scripts/SST_ATMExportManager.md)

## Tips

- Keep exports periodic and not too frequent.
- Use retention caps on event arrays.
- Prefer smaller snapshot formats when possible.
