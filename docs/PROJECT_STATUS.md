# TIBON — Project Status

Last updated: 2026-11-20

## Current milestone

**M0 — Environment & configuration check: complete.**
**M1 — Reference audit & page specification: complete.** No application code written in M1 by design.
**M2 — Design system & SEO decision: complete.** Documents only; no application code, no scaffolding, no dependencies installed.
**M3 — Frontend application scaffold: complete.** React Router Framework Mode SSR, shared layout/navigation/UI foundations, design tokens, tests, and documentation are implemented and verified. No backend was created.
**M4 — Homepage: complete.** All nine sections are implemented. TypeScript, ESLint, six Vitest tests, the production build and the SSR/Chromium checks passed. See [homepage implementation](HOME_PAGE_IMPLEMENTATION.md) for image sources and launch dependencies.

**M4.1 — Dark Culinary Redesign: complete.** Dark theme and responsive layouts are applied to all nine homepage sections and shared public UI. TypeScript, ESLint, six Vitest tests, production build, SSR and Chromium checks passed. See [homepage implementation](HOME_PAGE_IMPLEMENTATION.md) for verification and screenshots.

**M5.1 — Internal page foundation: complete.** Reusable internal page compositions and breadcrumbs are ready for approved content. Existing scaffold routes use the text-only hero. The homepage and internal gallery share a lightbox. See [component contracts](COMPONENT_SPECIFICATION.md#основа-внутренних-страниц-m51).

M5.1 verification includes 14 Vitest tests, TypeScript, ESLint, a production SSR smoke test for all registered public URLs and 404, and Chromium checks of both internal page layouts at 360, 390, 768, 1024, 1440 and 1920 px.

**M5.2 — Services and events pages: complete.** Eight public routes render sourced Russian-language content and page-specific metadata. Menus are available in HTML and as linked PDFs. TypeScript, ESLint, 14 Vitest tests and production SSR passed. Playwright MCP verified all eight pages at 360, 390, 768, 1024, 1440 and 1920 px. See [business data sources](BUSINESS_DATA_SOURCES.md).

**M5.3 — Frontend completion: complete.** Contacts, gallery, studio rules and the request form are implemented. The request form validates a draft locally through React Hook Form and Zod. Visitors can call the studio with or without JavaScript. `LeadDraft` carries the validated data for the future FastAPI integration.

TypeScript, ESLint, 23 Vitest tests, production build and SSR passed. Playwright MCP audited all registered public pages, both menu views and the 404 at 360, 390, 768, 1024, 1440 and 1920 px. It verified the map, gallery filters and keyboard focus, form validation and zero network submissions. At 390 px the nine lazy-loaded WebP previews total 300 KB. The corresponding full-size files total 1.62 MB.

**M6.1 — Backend Foundation: complete.** FastAPI, async PostgreSQL, the lead model and its Alembic migration, two health routes, and explicit CORS origins are in place. See [local startup](ARCHITECTURE.md#local-startup-powershell).

Ruff, the backend wheel build and 37 Pytest checks passed, including the migration round trip, database constraints and a health probe against PostgreSQL 18. The Alembic CLI applied the head revision and reported no schema drift. Frontend ESLint, TypeScript, 23 Vitest checks, the production build and the SSR/Chromium smoke test passed.

**M6.2 — Lead Submission API + Frontend Integration: complete.** The request form submits to FastAPI and confirms only a committed lead. PostgreSQL enforces one row per submission key. The form blocks duplicate clicks, preserves the draft on error, and reuses the key for unchanged retries. See the [lead API contract](API.md#m62--lead-submission).

Ruff, the backend wheel build, 48 Pytest checks, frontend ESLint, TypeScript, 29 Vitest checks, the production build and the SSR/Chromium smoke test passed. Alembic upgraded a local PostgreSQL 18.3 instance to `0002_lead_idempotency` and detected no schema drift. Playwright verified form layout at 360, 390, 768 and 1440 px and retried a draft after a real API outage. The retry returned `201`, the page displayed and focused the success message, and a direct PostgreSQL query confirmed exactly one committed row.

## Environment

| Tool | Status |
| --- | --- |
| Git | 2.52.0.windows.1 |
| Node.js / npm | v24.11.1 / 11.6.2 |
| Python | 3.12 used for backend verification via `py -3.12`; 3.14 also installed |
| PostgreSQL | 18, verified in an isolated native cluster |
| Docker | not installed |
| OpenCode | v2.2.7 |
| Playwright Chromium | installed for M3 browser smoke test |

## Repository state

- The `master` branch contains the project milestones through M6.2.
- Existing project content includes `AGENTS.md`, `opencode.jsonc`, `.opencode/`, `docs/`, `infra/`, and the root Playwright dev dependency.
- `frontend/` contains the independent React application and lockfile. `backend/` contains FastAPI, Alembic and Pytest. `infra/compose.yaml` provisions the local PostgreSQL service.

## Design documents (M1)

- `docs/REFERENCE_AUDIT.md` — аудит ti-bon.ru: карта 14 страниц, разбор каждой, функции (с пометкой «нужен backend»), сценарии, визуальный стиль, адаптивность, недостатки, целевая структура, открытые вопросы.
- `docs/PAGE_SPECIFICATION.md` — спецификация страниц нового сайта: токены, компоненты, формы и статусы заявок, секции каждой страницы, данные, адаптив, краткий список админки.

## Design documents (M2)

- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) records the M4.1 dark palette, typography, grid and WCAG contrast pairs.
- [COMPONENT_SPECIFICATION.md](COMPONENT_SPECIFICATION.md) records shared components and homepage composition.

### SEO decision (M2)

**React Router framework mode + SSR** для публичных страниц; админка — client-rendered за авторизацией. Обоснование и сравнение трёх вариантов — `ARCHITECTURE.md` §SEO & rendering; решение внесено в список Decisions. Причина: CMS-контент и мета-теги должны быть в HTML сразу и обновляться без пересборки (SSG этого не даёт).

### Reference pages status

- Все 14 URL из `page-sitemap.xml` отвечают 200 — недоступных (404/5xx) страниц нет.
- Без контента: `/prazdnik/` (пустая, `content.rendered: ""`), `/about/` (англоязычная заглушка Elementor).
- Сироты (нет в навигации): `/korporativ/`, `/den-rozhdeniya/`, `/romanticheskiy-uzhin/`, `/galereya/`, `/prazdnik/`, `/about/`.
- Мобильная вёрстка референса визуально не проверялась (нет браузера); выводы только по CSS-медиазапросам.

### Open questions from M1

- Основной телефон, адрес, часы и опубликованные базовые цены зафиксированы в [источниках M5.2](BUSINESS_DATA_SOURCES.md). Акции, вместимость, оборудование и часть возрастных условий требуют уточнения.
- Юридические тексты (политика ПД, оферта, согласие) — нужен источник от заказчика.
- Канал уведомлений о заявках (email / Telegram / CRM) и SLA ответа.

### Open questions from M2

- **Шрифты:** M3 использует локальные variable-пакеты Playfair Display и Inter с SIL Open Font License. Кириллические glyph-файлы присутствуют и загружаются в браузере; визуальное решение по реальным финальным H1/H2 остаётся на проверку при создании страниц.
- **Контраст:** в M4.1 белый текст CTA даёт 5.62:1 на красной заливке, при наведении — 7.23:1.
- **Айдентика:** в шапке и футере используется текстовый логотип TIBON с красным акцентом.
- **Фото:** главная использует временные иллюстрации Unsplash. Для публикации фото самой студии нужны материалы с подтверждёнными правами.
- **SSR-инфраструктура:** production SSR проверен локально; Node-контейнер в Docker deployment не проверен, Docker на машине не установлен.
- Перенумерация подтверждена: M2 — дизайн-система, каркас проекта — M3.

## Open items

- Docker is unavailable on the verification host. The local Compose PostgreSQL service still needs a container startup check. The later deployment must include the Node SSR service.
- The studio profile and privacy policy remain `noindex` until approved content is available. The request route also uses `noindex`.
- Set `PUBLIC_SITE_ORIGIN` only after confirming the publication domain. Without it, `robots.txt` blocks crawling and `sitemap.xml` returns 404. With it, the sitemap contains 12 canonical content pages. The contact alias, request route and unfinished pages are excluded.
- Public release of lead submission still needs the approved privacy policy. The request page offers the studio phone as a fallback.
- Lead throttling runs per API process and resets on restart. Idempotency remains enforced in PostgreSQL across processes.

## Milestones

| # | Scope | State |
| --- | --- | --- |
| M0 | Environment, OpenCode config, docs skeleton | done |
| M1 | Reference audit & page specification (design docs) | done |
| M2 | Design system, component specification, SEO/rendering decision (docs only) | done |
| M3 | Frontend scaffold, SSR, shared UI foundations, token implementation, tests | done |
| M4 | Homepage design, content and browser verification | done |
| M4.1 | Dark Culinary Redesign and responsive verification | done |
| M5.1 | Internal page foundations | done |
| M5.2 | Services, event pages and menu | done |
| M5.3 | Contacts, gallery, rules, local request form and frontend audit | done |
| M6.1 | Backend foundation, database migrations, health and lead contract | done |
| M6.2 | Lead submission and frontend integration | done |
| M6.3 | Subsequent backend work | awaiting explicit approval |
