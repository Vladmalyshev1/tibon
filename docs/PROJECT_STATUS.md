# TIBON — Project Status

Last updated: 2026-11-20

## Current milestone

**M0 — Environment & configuration check: complete.**
**M1 — Reference audit & page specification: complete.** No application code written in M1 by design.

## Environment

| Tool | Status |
| --- | --- |
| Git | 2.52.0.windows.1 |
| Node.js / npm | v24.11.1 / 11.6.2 |
| Python | 3.14.0 via `py` launcher; `python` alias broken (Microsoft Store stub), `pip` not on PATH |
| Docker | not installed |
| OpenCode | v2.2.7 |

## Repository state

- Branch `master`, commits: M0 baseline (`chore(M0)`); no remote configured.
- Tracked content so far: `AGENTS.md`, `opencode.jsonc`, `.opencode/`, `docs/`, `infra/` (empty), `package.json` (Playwright dev dependency only).
- `frontend/` and `backend/` do not exist yet — expected, created in M2.

## Design documents (M1)

- `docs/REFERENCE_AUDIT.md` — аудит ti-bon.ru: карта 14 страниц, разбор каждой, функции (с пометкой «нужен backend»), сценарии, визуальный стиль, адаптивность, недостатки, целевая структура, открытые вопросы.
- `docs/PAGE_SPECIFICATION.md` — спецификация страниц нового сайта: токены, компоненты, формы и статусы заявок, секции каждой страницы, данные, адаптив, краткий список админки.

### Reference pages status

- Все 14 URL из `page-sitemap.xml` отвечают 200 — недоступных (404/5xx) страниц нет.
- Без контента: `/prazdnik/` (пустая, `content.rendered: ""`), `/about/` (англоязычная заглушка Elementor).
- Сироты (нет в навигации): `/korporativ/`, `/den-rozhdeniya/`, `/romanticheskiy-uzhin/`, `/galereya/`, `/prazdnik/`, `/about/`.
- Мобильная вёрстка референса визуально не проверялась (нет браузера); выводы только по CSS-медиазапросам.

### Open questions from M1

- Цены, акции, телефон, email, мессенджеры, адрес, часы, реквизиты, вместимость, оборудование, возрастные правила — не подтверждены (полный список: `REFERENCE_AUDIT.md` §10).
- Юридические тексты (политика ПД, оферта, согласие) — нужен источник от заказчика.
- Пара шрифтов (Playfair Display + Inter — предложение), домен и сохранение айдентики.
- Канал уведомлений о заявках (email / Telegram / CRM) и SLA ответа.
- SPA и SEO: нужен пререндер/SSG публичных страниц, иначе мета и контент могут не индексироваться. Решение по архитектуре — до M2.
- Подтвердить перенумерацию: исследовательский этап занял номер M1, каркас проекта становится M2.

## Open items

- Docker is unavailable: Docker Compose / Nginx deployment cannot be verified until it is installed.
- Python `python`/`pip` on PATH are broken; use `py -m pip`. Decide whether to fix the alias or use a venv/`uv` in M2.
- No test, lint or build tooling exists yet (nothing to run at M0).

## Milestones

| # | Scope | State |
| --- | --- | --- |
| M0 | Environment, OpenCode config, docs skeleton | done |
| M1 | Reference audit & page specification (design docs) | done |
| M2 | Project scaffolding (frontend + backend skeleton) | not started |
