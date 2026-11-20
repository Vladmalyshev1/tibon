# TIBON — Architecture

Agreed stack and structural decisions. Tooling rules live in `AGENTS.md`; this file records the architecture only.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React + TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, React Hook Form, Zod |
| Backend | Python, FastAPI, SQLAlchemy 2, Pydantic, Alembic, PostgreSQL |
| Testing | Vitest + React Testing Library (unit/component), Pytest (API), Playwright (E2E) |
| Infrastructure | Docker Compose, Nginx reverse proxy |

## Repository layout (target)

```
frontend/   React + TypeScript, Vite (React Router framework mode)
backend/    FastAPI, SQLAlchemy models, Pydantic schemas, Alembic and Pytest
infra/      Docker Compose, Nginx config, deployment assets
docs/       PROJECT_STATUS.md, ARCHITECTURE.md, API.md
```

## Backend and Telegram delivery

- `backend/app/api` maps service results to versioned HTTP responses. `services/health.py` controls the database probe timeout and translates connectivity failures. `repositories/health.py` runs the PostgreSQL probe.
- `config.py` validates environment variables and loads the root `.env` in the source checkout. Process variables take precedence. `database.py` creates an async SQLAlchemy engine using asyncpg. FastAPI creates and disposes of its engine in the application lifespan. Alembic owns schema changes and runs separately.
- `models/lead.py` stores validated form fields, consent, a UUID, and the lead's status. PostgreSQL supplies timezone-aware timestamps and refreshes `updated_at` with a trigger on update.
- `schemas/lead.py` validates the shape of `LeadDraft`. `services/leads.py` applies the studio date rule for new leads, owns the transaction and resolves retries using the unique submission key. `repositories/leads.py` runs parameterized PostgreSQL statements with transaction-local timeouts. The public lead route returns the UUID after commit. See [API.md](API.md) for the contract.
- Names, phone numbers and comments are personal data. SQLAlchemy SQL echo stays off and bound parameters are hidden. The Compose database suppresses error detail and statement text for ordinary query errors. Apply equivalent settings when configuring a native or hosted PostgreSQL instance for personal data. Application errors return fixed messages and lead request bodies are kept out of logs.
- `/zayavka/` sends JSON to same-origin `/api/v1/leads` without cookies. Vite proxies `/api/` to `INTERNAL_API_URL` in development and overwrites the forwarded client address and scheme. The production proxy must do the same. Direct peers are the default. `TRUSTED_PROXY_IPS` is a JSON list of exact proxy peer IP addresses for the app middleware. Start Uvicorn with `--no-proxy-headers` so it leaves the transport peer intact for this check.
- FastAPI inserts an outbox row in `telegram_notifications` in the lead transaction. The separate worker claims committed rows, sends through the Telegram Bot API, and records delivery. PostgreSQL is the source of truth for both the lead and delivery state. Operators receive notifications through Telegram and inspect delivery locally through the [worker CLI](TELEGRAM_NOTIFICATIONS.md).
- The menu page reuses the lead validators and API for download requests. After the lead and Telegram job commit, FastAPI authorizes a fixed PDF from `MENU_PDF_DIR` for the UUID and original submission key. Keep the files outside frontend assets and web server public directories. The browser retries a failed download with the saved request UUID.

### Local startup (PowerShell)

From the repository root, copy `.env.example` to `.env` and set a local `POSTGRES_PASSWORD`. The Compose database listens on `127.0.0.1:55432` by default, with persistent storage. An existing PostgreSQL instance can be used by setting `POSTGRES_*` for a dedicated local database and role.

```powershell
Copy-Item .env.example .env
# Edit .env and set POSTGRES_PASSWORD before starting the database.
docker compose --env-file .env -f infra/compose.yaml up -d --wait db
py -3.12 -m venv .venv
Set-Location backend
..\.venv\Scripts\python.exe -m pip install -e ".[dev]"
..\.venv\Scripts\python.exe -m alembic upgrade head
..\.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --reload --no-proxy-headers --no-access-log
```

In another terminal, query `http://127.0.0.1:8000/api/v1/health` and `http://127.0.0.1:8000/api/v1/health/db`. Both should return `{"status":"ok"}`. To run the PostgreSQL integration tests from `backend/`, set `$env:TIBON_TEST_POSTGRES = "1"` and run `..\.venv\Scripts\python.exe -m pytest`. The test role needs permission to create a temporary test schema in the target local database. Pytest without the flag runs the checks that require no database.

An installed local PostgreSQL instance is sufficient. Create a dedicated database and role, point the root `.env` `POSTGRES_*` settings at it, and skip the Compose command. Run `alembic upgrade head` to apply the lead and notification migrations. With Uvicorn running, run `npm run dev` in `frontend/` and open `http://localhost:5173/zayavka/`. The browser uses `localhost` or HTTPS for secure UUID generation. If Uvicorn listens on a different port, update `INTERNAL_API_URL` in the root `.env` and restart Vite.

For the live browser test, point both services at a disposable local PostgreSQL database, install the PDFs as described below, then run `npm run test:lead-e2e` from `frontend/`. Set `TIBON_E2E_URL` if Vite uses a different local URL. The script saves one synthetic event lead and two synthetic menu requests, then prints their UUIDs and the downloaded file hashes. See the [production readiness checklist](PRODUCTION_READINESS.md) before accepting real submissions.

Place the official adult and children's PDFs in `backend/private-menus` as `adults.pdf` and `kids.pdf`. This directory is ignored by Git. Alternatively set `MENU_PDF_DIR` to an absolute private directory on the server. The original WordPress links remain independently hosted by the old site. [Adult source PDF](https://ti-bon.ru/wp-content/uploads/2025/11/Меню_взрослое.pdf) · [Children's source PDF](https://ti-bon.ru/wp-content/uploads/2025/11/Меню_детское.pdf)

## SEO & rendering

Public content pages include their metadata, canonical URL when configured, and page content in the initial HTML response.

| Option | SEO | Dev complexity | Fit with stack | Content changes | Deploy |
| --- | --- | --- | --- | --- | --- |
| SPA, no prerender | Poor: single shell HTML, meta injected client-side | Lowest | Native (Vite + React Router) | Fine | Static only |
| SPA + SSG/prerender at build | Good for static routes | Medium: prerender step, route list, meta per route | Native, but adds a build plugin | **Stale**: every CMS edit needs rebuild/redeploy (or a publish webhook) | Static + rebuild pipeline |
| React Router framework mode, SSR | Good: full HTML per request, supports loader-based metadata | Medium: Node server | Native: React Router v7 runs on Vite | Current content ships with the frontend | Nginx → Node SSR process and FastAPI |

**Decision: React Router framework mode with SSR** for public routes.

- Public routes render on the server with content maintained in the frontend repository. FastAPI handles lead submission and validation.
- `meta`/`links` exports produce per-route title, description, OG, canonical, JSON-LD (`Organization`/`LocalBusiness`, `Service`/`Offer`, `BreadcrumbList`). `/zayavka/` and 404 are `noindex`.
- Frontend route loaders generate `sitemap.xml` and `robots.txt` from the public route list and configured publishing origin.
- Forms keep RHF + Zod on the client and POST to FastAPI; SSR does not change the form contract.
- Fallback if a Node runtime is rejected at deploy: SPA + prerender at build with a publish webhook that triggers a rebuild. This is the documented second choice, not the plan.
- The frontend accesses lead storage through FastAPI.

## Decisions

- Frontend and backend are separate build units in one repository; Nginx terminates TLS, proxies public page requests to the SSR process and `/api` to FastAPI.
- All external input is validated at the API boundary with Pydantic schemas; frontend forms use Zod with matching rules.
- Public page and menu descriptions are maintained through repository content. The PDF copies are served through the protected download endpoint.
- Contracts are versioned through `/api` paths; the contract itself is documented in `docs/API.md`.
- Local development runs the database in Docker; frontend and backend run natively with hot reload.
- Public pages are rendered with React Router framework mode so content and meta tags are in the HTML. Rationale and alternatives are in §SEO & rendering.

## Open decisions (resolve when the milestone needs them)

- Image/media storage: local volume vs object storage.
- Deployment target for production.
