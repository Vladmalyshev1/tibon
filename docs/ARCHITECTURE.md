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

## Backend foundation (M6.1)

- `backend/app/api` maps service results to versioned HTTP responses. `services/health.py` controls the database probe timeout and translates connectivity failures. `repositories/health.py` runs the PostgreSQL probe.
- `config.py` validates environment variables and loads the root `.env` in the source checkout. Process variables take precedence. `database.py` creates an async SQLAlchemy engine using asyncpg. FastAPI creates and disposes of its engine in the application lifespan. Alembic owns schema changes and runs separately.
- `models/lead.py` stores the validated form fields, consent, a UUID and a status from `new`, `contacted`, `confirmed`, `declined` and `archived`. PostgreSQL supplies timezone-aware timestamps and refreshes `updated_at` with a trigger on update. The `(status, created_at)` index supports a future admin queue. Status transitions will be handled by the future admin service.
- `schemas/lead.py` validates `LeadDraft`. `services/leads.py` owns the transaction and resolves retries using the unique submission key. `repositories/leads.py` runs parameterized PostgreSQL statements. The public lead route returns the UUID after commit. See [API.md](API.md) for the contract.
- Names, phone numbers and comments are personal data. SQLAlchemy SQL echo stays off and bound parameters are hidden. The Compose database suppresses error detail and statement text for ordinary query errors. Apply equivalent settings when configuring a native or hosted PostgreSQL instance for personal data. Application errors return fixed messages and lead request bodies are kept out of logs.
- `/zayavka/` sends JSON to same-origin `/api/v1/leads`. Vite proxies `/api/` to `INTERNAL_API_URL` in development. The deployment proxy serves that path through FastAPI.

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
..\.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --reload
```

In another terminal, query `http://127.0.0.1:8000/api/v1/health` and `http://127.0.0.1:8000/api/v1/health/db`. Both should return `{"status":"ok"}`. To run the PostgreSQL integration tests from `backend/`, set `$env:TIBON_TEST_POSTGRES = "1"` and run `..\.venv\Scripts\python.exe -m pytest`. The test role needs permission to create a temporary test schema in the target local database. Pytest without the flag runs the checks that require no database.

For M6.2, an installed local PostgreSQL instance is sufficient. Create a dedicated database and role, point the root `.env` `POSTGRES_*` settings at it, and skip the Compose command. Run `alembic upgrade head` to apply `0002_lead_idempotency`. With Uvicorn running, run `npm run dev` in `frontend/` and open `http://localhost:5173/zayavka/`. The browser uses `localhost` or HTTPS for secure UUID generation. If Uvicorn listens on a different port, update `INTERNAL_API_URL` in the root `.env` and restart Vite.

## SEO & rendering

Public pages must be indexable: unique `title`/`description` from CMS, OG tags, canonical, JSON-LD, and the page content itself have to exist in the HTML response, not only after hydration.

| Option | SEO | Dev complexity | Fit with stack | Dynamic CMS content | Deploy |
| --- | --- | --- | --- | --- | --- |
| SPA, no prerender | Poor: single shell HTML, meta injected client-side | Lowest | Native (Vite + React Router) | Fine | Static only |
| SPA + SSG/prerender at build | Good for static routes | Medium: prerender step, route list, meta per route | Native, but adds a build plugin | **Stale**: every CMS edit needs rebuild/redeploy (or a publish webhook) | Static + rebuild pipeline |
| React Router framework mode, SSR | Good: full HTML per request, meta/JSON-LD from loaders | Medium-high: Node server, server-side data fetching | Native: React Router v7 *is* the router already in the stack, runs on Vite; Tailwind/Framer Motion/RHF/Zod unaffected | **Fresh**: loaders fetch from FastAPI per request, cache headers control freshness | Nginx → Node SSR process → FastAPI (one extra container) |

**Decision: React Router framework mode with SSR** for public routes.

- Public routes render on the server through route `loader`s that call FastAPI over the internal network (`INTERNAL_API_URL`); FastAPI stays the single source of truth for content and validation. Admin edits appear without a rebuild.
- Admin routes (`/admin/*`) use `clientLoader` and are never server-rendered with data; they are auth-gated and `noindex`.
- `meta`/`links` exports produce per-route title, description, OG, canonical, JSON-LD (`Organization`/`LocalBusiness`, `Service`/`Offer`, `BreadcrumbList`). `/zayavka/` and 404 are `noindex`.
- `sitemap.xml` and `robots.txt` are generated by the backend from published CMS content, not hand-maintained.
- Forms keep RHF + Zod on the client and POST to FastAPI; SSR does not change the form contract.
- Fallback if a Node runtime is rejected at deploy: SPA + prerender at build with a publish webhook that triggers a rebuild. This is the documented second choice, not the plan.
- Costs accepted: one extra container, cache invalidation policy for content loaders, and no direct DB access from the frontend (all data through FastAPI).

## Decisions

- Frontend and backend are separate build units in one repository; Nginx terminates TLS, proxies public page requests to the SSR process and `/api` to FastAPI.
- All external input is validated at the API boundary with Pydantic schemas; frontend forms use Zod with matching rules.
- Content (pages, dishes, services, media) is stored in PostgreSQL and edited via the admin CMS — no hardcoded content in production pages.
- Contracts are versioned through `/api` paths; the contract itself is documented in `docs/API.md`.
- Local development runs the database in Docker; frontend and backend run natively with hot reload.
- Public pages are rendered with React Router framework mode (SSR) so CMS content and meta tags are in the HTML; the admin panel is client-rendered behind auth. Rationale and alternatives: §SEO & rendering.

## Open decisions (resolve when the milestone needs them)

- Auth strategy for the admin CMS (session cookie vs JWT).
- Image/media storage: local volume vs object storage.
- Deployment target for production.
