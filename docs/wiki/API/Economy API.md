# Economy API

Economy endpoints combine:

- trade logs from Expansion Market
- spawn/type data parsed from `types.xml`

Endpoints:

- `GET /economy`
- `GET /economy/spawn-data`
- `GET /economy/spawn-data/:className`

Archive endpoints (if enabled):

- `GET /archive/trades/stats`
- `GET /archive/trades/top-items`
