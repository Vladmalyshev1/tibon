# TIBON — API Contracts

## M6.1 — Health

The API prefix is `/api/v1`. Both health routes return JSON and `Cache-Control: no-store`.

| Method and path | Response |
| --- | --- |
| `GET /api/v1/health` | `200 {"status":"ok"}` when the API process is serving requests. |
| `GET /api/v1/health/db` | `200 {"status":"ok"}` after executing `SELECT 1` against configured PostgreSQL, or `503 {"status":"unavailable"}` on connection/query failure or timeout. |

The database probe checks connectivity. Use `alembic current` to inspect the deployed schema revision. Cross-origin browser requests are supported for exact origins in `CORS_ORIGINS`.

## M6.2 — Lead submission

`POST /api/v1/leads` accepts `Content-Type: application/json` and the optional `Idempotency-Key` header containing a UUID. The form keeps keys for up to eight recent attempted payloads in the current page's memory and reuses the matching key after an ambiguous failure. Reloading the page clears those keys. Clients omitting the header create a new lead on each valid request. Lead submission responses carry `Cache-Control: no-store`.

| JSON field | Type | Validation |
| --- | --- | --- |
| `name` | string, required | Trimmed, 2–80 characters. |
| `phone` | string, required | Canonical format `+7` followed by ten ASCII digits. `LeadDraft` already normalizes the number. |
| `format` | string, required | `adults`, `kids`, `corporate`, `birthday`, `romantic`, `rental` or `extras`. |
| `date` | string or null, optional | ISO calendar date `YYYY-MM-DD`. New submissions must use today or later in `Europe/Samara`. A matching committed submission can be retried after its date has passed. Omit it when the visitor leaves the field empty. Stored as `event_date`. |
| `guests` | integer or null, optional | A JSON integer from 1 to 10,000. This validation range does not describe studio capacity. |
| `source` | string or null, optional | `menu_adults` or `menu_kids` for requests from the PDF form. The form submits the matching `format` (`adults` or `kids`) and a UUIDv4 `Idempotency-Key`. Event submissions can omit `source`. |
| `comment` | string or null, optional | Trimmed, at most 1000 characters. Blank text is stored as null. |
| `consent` | boolean, required | Must be JSON `true`. |

The server rejects additional fields. The database generates the UUID and timestamps and sets the initial status to `new`.

| Status | Response |
| --- | --- |
| `201` | `{"id":"5d34edf2-4f64-4d16-9a82-0701bc872355"}` after committing the lead and its Telegram delivery job. Telegram delivery runs independently. The lead records a request for follow-up and leaves booking availability unchanged. |
| `200` | The same UUID after a valid retry with the same key and normalized data. PostgreSQL enforces one row per key even for concurrent requests. |
| `409` | `{"detail":"Submission key already used"}` when the key belongs to a different payload. |
| `408` | `{"detail":"Request body timed out"}` when the API takes more than five seconds to receive the body. |
| `413` | `{"detail":"Request body too large"}` for a request body over 8 KiB. |
| `415` | `{"detail":"Content-Type must be application/json"}` for other media types. |
| `422` | An `errors` object mapping a recognised field to `required` or `invalid`, for example `{"errors":{"consent":"required"}}`. Malformed JSON, unknown fields and an invalid submission key use `body`. The response omits submitted values and raw validation exceptions. |
| `429` | `{"detail":"Too many requests"}` with `Retry-After` in seconds. The API counts up to eight attempts per IPv4 address or IPv6 /64 in a rolling 60-second window per API process. |
| `503` | `{"detail":"Service unavailable"}` if the database operation fails or times out. Retry an unchanged request with its original key. |

The limiter keeps up to 4,096 client buckets per process. New clients share an overflow bucket while capacity is full. IPv4-mapped IPv6 is grouped with IPv4. Restarting the process resets the limiter. The app trusts forwarded headers only from addresses configured in `TRUSTED_PROXY_IPS` when Uvicorn runs with `--no-proxy-headers`. The proxy must overwrite the forwarded address and scheme.

PostgreSQL enforces the key for the lifetime of the lead. After an uncertain response, send the same body and key even if the first request might have committed. The lead transaction has a 1.5-second PostgreSQL lock timeout, a four-second statement timeout, and an eight-second application deadline.

M7 maintains one Telegram job per new lead. A replay reuses the original UUID and job. Missing and null values for the new optional fields are equivalent for replays of pre-M7 requests. See [Telegram worker operations](TELEGRAM_NOTIFICATIONS.md).

## M7 — Menu PDF retrieval

After `POST /api/v1/leads` returns a menu request UUID, send `GET /api/v1/leads/{lead_id}/menu` with the same `Idempotency-Key` header. PostgreSQL resolves the PDF type from the committed request. A successful response is an `application/pdf` attachment with `Cache-Control: no-store`. The key is sent as a header and kept in browser memory.

- `404` covers a missing key, no matching menu request or a request older than 24 hours.
- `503` covers an unavailable database or local PDF. The same pair can be retried after recovery.
- `429` uses the existing lead rate limit and returns `Retry-After`. Submission and download attempts share the same budget. Menu submissions with no UUIDv4 key return `422`.
