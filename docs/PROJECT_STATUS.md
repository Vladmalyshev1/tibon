# TIBON — Project Status

Last updated: 2026-11-20

## Current milestone

**M0 — Environment & configuration check: complete.**
M1 not started (waiting for the user's go-ahead).

## Environment

| Tool | Status |
| --- | --- |
| Git | 2.52.0.windows.1 |
| Node.js / npm | v24.11.1 / 11.6.2 |
| Python | 3.14.0 via `py` launcher; `python` alias broken (Microsoft Store stub), `pip` not on PATH |
| Docker | not installed |
| OpenCode | v2.2.7 |

## Repository state

- Branch `master`, no commits yet; no remote configured.
- Tracked content so far: `AGENTS.md`, `opencode.jsonc`, `.opencode/`, `docs/`, `infra/` (empty), `package.json` (Playwright dev dependency only).
- `frontend/` and `backend/` do not exist yet — expected, created in M1.

## Open items

- Docker is unavailable: Docker Compose / Nginx deployment cannot be verified until it is installed.
- Python `python`/`pip` on PATH are broken; use `py -m pip`. Decide whether to fix the alias or use a venv/`uv` in M1.
- No test, lint or build tooling exists yet (nothing to run at M0).

## Milestones

| # | Scope | State |
| --- | --- | --- |
| M0 | Environment, OpenCode config, docs skeleton | done |
| M1 | Project scaffolding (frontend + backend skeleton) | not started |
