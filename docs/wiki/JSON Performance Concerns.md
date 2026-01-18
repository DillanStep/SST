# JSON Performance Concerns

SST intentionally uses JSON files as a durable bridge between:

- the DayZ server runtime (Enforce Script)
- the external Node API + web dashboard

This approach is simple and debuggable, but disk I/O can become a bottleneck if you export too frequently or write huge payloads.

## What affects performance most

- **Export frequency** (e.g., every 2s vs every 30s)
- **Payload size** (inventory trees are large; event logs grow over time)
- **Number of players** (per-player JSON files scale linearly)
- **Server storage** (HDD vs SSD) and antivirus scanning

## Best practices

- Prefer **event logs** for high-frequency data and **snapshots** for periodic data.
- Keep retention caps on log arrays (SST already does this in several places).
- Increase intervals on busy servers:
  - inventory exporting is often fine at 10–30 seconds
  - position tracking can be 30–120 seconds
- Avoid rewriting huge files if you only need to append:
  - prefer “append-like” patterns (or segmented files) for very large logs

## When you should change the design

If you want real-time streaming updates (sub-second) or very large datasets, consider:

- SQLite (write events as rows)
- a lightweight binary format
- in-memory cache with periodic persistence

SST’s current architecture favors simplicity and modding ergonomics over maximum throughput.
