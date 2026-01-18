# Authentication

SST uses two layers:

1. **Session authentication (JWT)** – user must be logged in
2. **API key** – request must be authorized for the server

## JWT

Token sources (in order):

- `Authorization: Bearer <token>`
- Cookie `auth_token=<token>`

Login:

- `POST /auth/login`

## API key

Provide via:

- Header: `X-API-Key: <key>`
- Or query string: `?apiKey=<key>`

If `API_KEY` is missing from `apps/api/.env`, the server generates one on startup.

See the full behavior in:

- [apps/api/docs/API.md](../../../apps/api/docs/API.md)
