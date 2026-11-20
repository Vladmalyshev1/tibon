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
frontend/   React + Vite SPA
backend/    FastAPI app (app/api, app/models, app/schemas, app/services, alembic/)
infra/      Docker Compose, Nginx config, deployment assets
docs/       PROJECT_STATUS.md, ARCHITECTURE.md, API.md
```

## Decisions

- Frontend and backend are separate build units in one repository; Nginx serves the built SPA and proxies `/api` to FastAPI.
- All external input is validated at the API boundary with Pydantic schemas; frontend forms use Zod with matching rules.
- Content (pages, dishes, services, media) is stored in PostgreSQL and edited via the admin CMS — no hardcoded content in production pages.
- Contracts are versioned through `/api` paths; the contract itself is documented in `docs/API.md`.
- Local development runs the database in Docker; frontend and backend run natively with hot reload.

## Open decisions (resolve when the milestone needs them)

- Auth strategy for the admin CMS (session cookie vs JWT).
- Image/media storage: local volume vs object storage.
- Deployment target for production.
