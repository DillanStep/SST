# Logs API

The API can read DayZ logs from configured profile paths.

Endpoints:

- `GET /logs/types`
- `GET /logs/list/:type`
- `GET /logs/read/:type/:fileName`
- `GET /logs/latest/script`
- `GET /logs/latest/crash`
- `GET /logs/latest/rpt`
- `GET /logs/summary`

Configuration lives in the Node API `.env`.
