# TIBON — API Contracts

## M6.1 — Health

The API prefix is `/api/v1`. Both health routes return JSON and `Cache-Control: no-store`.

| Method and path | Response |
| --- | --- |
| `GET /api/v1/health` | `200 {"status":"ok"}` when the API process is serving requests. |
| `GET /api/v1/health/db` | `200 {"status":"ok"}` after executing `SELECT 1` against configured PostgreSQL, or `503 {"status":"unavailable"}` on connection/query failure or timeout. |

The database probe checks connectivity. Use `alembic current` to inspect the deployed schema revision. Cross-origin browser requests are supported for exact origins in `CORS_ORIGINS`.

## M6.2 — Lead submission

`POST /api/v1/leads` accepts `Content-Type: application/json` and the optional `Idempotency-Key` header containing a UUID. The browser sends one randomly generated key per submission and reuses it when retrying the same validated payload. Clients omitting the header create a new lead on each valid request. Successful and error responses carry `Cache-Control: no-store`.

| JSON field | Type | Validation |
| --- | --- | --- |
| `name` | string, required | Trimmed, 2–80 characters. |
| `phone` | string, required | Canonical format `+7` followed by ten ASCII digits. `LeadDraft` already normalizes the number. |
| `format` | string, required | `adults`, `kids`, `corporate`, `birthday`, `romantic`, `rental` or `extras`. |
| `date` | string or null, optional | ISO calendar date `YYYY-MM-DD`, today or later in `Europe/Samara`. Omit it when the visitor leaves the form field empty. Stored as `event_date`. |
| `comment` | string or null, optional | Trimmed, at most 1000 characters. Blank text is stored as null. |
| `consent` | boolean, required | Must be JSON `true`. |

The server rejects additional fields. The database generates the UUID and timestamps and sets the initial status to `new`.

| Status | Response |
| --- | --- |
| `201` | `{"id":"5d34edf2-4f64-4d16-9a82-0701bc872355"}` after the database commit. The lead records a request for follow-up and leaves booking availability unchanged. |
| `200` | The same UUID after a valid retry with the same key and normalized data. PostgreSQL enforces one row per key even for concurrent requests. |
| `409` | `{"detail":"Submission key already used"}` when the key belongs to a different payload. |
| `413` | `{"detail":"Request body too large"}` for a request body over 8 KiB. |
| `415` | `{"detail":"Content-Type must be application/json"}` for other media types. |
| `422` | An `errors` object mapping a recognised field to `required` or `invalid`, for example `{"errors":{"consent":"required"}}`. Malformed JSON, unknown fields and an invalid submission key use `body`. The response omits submitted values and raw validation exceptions. |
| `429` | `{"detail":"Too many requests"}` with `Retry-After` in seconds. The API counts up to eight attempts per client IP in a 60-second window per API process. |
| `503` | `{"detail":"Service unavailable"}` if the database operation fails or times out. Retry an unchanged request with its original key. |

The rate limit uses bounded memory and resets on restart. Behind a reverse proxy, Uvicorn should trust only the proxy, and the proxy should overwrite `X-Forwarded-For` with the verified client address. The PostgreSQL key remains valid for the life of the lead record.
