# TIBON — Lead submission production readiness

M6.3 and M7 verify lead submission and delivery locally. Use a deployment environment and synthetic data to complete the release checks before accepting customer submissions.

## Release blockers

- [ ] Obtain the approved personal data policy and final consent text covering Telegram delivery, publish both in the relevant pages, and verify the link and consent in the request flow. Confirm authorized access, retention and deletion in both PostgreSQL and the Telegram chat before enabling production delivery.
- [ ] Verify HTTPS and same-origin routing on the intended deployment. Restrict the FastAPI port to the reverse proxy. Set `TRUSTED_PROXY_IPS` to the exact transport peer addresses and use the startup flags documented in [ARCHITECTURE.md](ARCHITECTURE.md). Validate forwarded client identity from the actual edge and confirm the direct backend port is unreachable externally.
- [ ] Provision production secrets and separate database roles for migration, API and Telegram worker. The runtime API needs `CONNECT`, schema `USAGE`, `INSERT`/`SELECT` on `leads` and `INSERT` on `telegram_notifications`. The worker needs read access to `leads` and `SELECT`/`UPDATE` on `telegram_notifications`. Use `POSTGRES_SSLMODE=verify-full` and the trusted CA via `PGSSLROOTCERT` when the database is reached over a network. Confirm migrations, schema drift, and a backup restore in the target environment.
- [ ] Inspect deployment logs with synthetic requests that succeed or fail. Disable body and header capture in the proxy and telemetry. Exclude query strings from access logs. Match the PostgreSQL settings for terse errors and suppressed bind values in [infra/compose.yaml](../infra/compose.yaml).

## Checks before rollout

- [ ] Apply `alembic upgrade head`, confirm `alembic current` matches `alembic heads`, and run `alembic check`. Probe both health endpoints and validate a fresh submission before routing live traffic.
- [ ] Keep one API worker if relying on the in-process limiter alone. For multiple workers or replicas, enforce the intended shared limit at the existing edge. Allow the proxy enough time for both the body and database deadlines, cap request bodies at 8 KiB for this route, and check `429` and `Retry-After` during staging.
- [ ] For an Nginx edge directly receiving customer traffic, overwrite `X-Forwarded-For` with `$remote_addr` and `X-Forwarded-Proto` with `$scheme`. If a CDN or load balancer precedes Nginx, verify client address resolution at that ingress before using this configuration. Keep CORS empty for a same-origin deployment or list only the actual frontend origins.
- [ ] Confirm operational alerts for API/DB availability, 503s and 429s. Use status and timing data with synthetic identifiers.
- [ ] Configure the dedicated bot and restricted chat through the [Telegram runbook](TELEGRAM_NOTIFICATIONS.md). Inject the Telegram secrets in the worker only. Verify a synthetic message, supervise the process, and monitor delivery age and failed counts.
- [ ] Install both official PDFs in the backend-only `MENU_PDF_DIR`. Confirm each download through the menu form and verify that the deployment serves a PDF only with the saved request UUID and its submission key.
- [ ] Run the browser scenario from [ARCHITECTURE.md](ARCHITECTURE.md) and repeat it behind the intended proxy. Confirm consent validation, draft recovery, successful commit, and replay. Run the production dependency and image audits against the artifacts selected for deployment.

## Known limits

- The throttle is local to each worker, resets on restart, and shares a bucket among previously untracked clients when its memory capacity is reached. Shared networks and IPv6 /64 groups also share a budget.
- Browser retries can reuse a key while the page remains open and the payload is among its eight remembered attempts. Calls without a key and new sessions can create duplicates. Recovery depends on the existing lead still being present in PostgreSQL.
- Telegram delivery can produce a duplicate when the provider accepts a message without a confirmed local result. The UUID in the message identifies the lead.
- The local tests exercise Vite, FastAPI and native PostgreSQL. The intended production ingress, PostgreSQL grants and TLS, deployment logs, and backup restore remain to be verified in the target environment.

Operational references for proxy configuration and logging. [Uvicorn settings](https://www.uvicorn.org/settings/) · [Nginx proxy headers](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header) · [PostgreSQL 18 logging](https://www.postgresql.org/docs/18/runtime-config-logging.html)
