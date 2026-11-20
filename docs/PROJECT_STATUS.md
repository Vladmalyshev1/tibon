# TIBON — Project Status

Last updated: 2026-11-20

## Current milestone

**M0 — Environment & configuration check: complete.**
**M1 — Reference audit & page specification: complete.** No application code written in M1 by design.
**M2 — Design system & SEO decision: complete.** Documents only; no application code, no scaffolding, no dependencies installed.
**M3 — Frontend application scaffold: complete.** React Router Framework Mode SSR, shared layout/navigation/UI foundations, design tokens, tests, and documentation are implemented and verified. No backend was created.
**M4 — Homepage: complete.** All nine sections are implemented. TypeScript, ESLint, six Vitest tests, the production build and the SSR/Chromium checks passed. See [homepage implementation](HOME_PAGE_IMPLEMENTATION.md) for image sources and launch dependencies.

## Environment

| Tool | Status |
| --- | --- |
| Git | 2.52.0.windows.1 |
| Node.js / npm | v24.11.1 / 11.6.2 |
| Python | 3.14.0 via `py` launcher; `python` alias broken (Microsoft Store stub), `pip` not on PATH |
| Docker | not installed |
| OpenCode | v2.2.7 |
| Playwright Chromium | installed for M3 browser smoke test |

## Repository state

- Branch `master`, M0 and M1 commits present. M2–M4 changes remain in the working copy.
- Existing project content includes `AGENTS.md`, `opencode.jsonc`, `.opencode/`, `docs/`, `infra/`, and the root Playwright dev dependency.
- `frontend/` now contains the independent React application and lockfile; `backend/` is not created in M3.

## Design documents (M1)

- `docs/REFERENCE_AUDIT.md` — аудит ti-bon.ru: карта 14 страниц, разбор каждой, функции (с пометкой «нужен backend»), сценарии, визуальный стиль, адаптивность, недостатки, целевая структура, открытые вопросы.
- `docs/PAGE_SPECIFICATION.md` — спецификация страниц нового сайта: токены, компоненты, формы и статусы заявок, секции каждой страницы, данные, адаптив, краткий список админки.

## Design documents (M2)

- `docs/DESIGN_SYSTEM.md` — единая система: концепция, палитра с производными, типографика (Playfair Display + Inter), сетка и брейкпоинты 360/480/768/1024/1280/1440, шкала отступов 4 px, токены `--color-*` / `--text-*` / `--space-*`, визуальные спеки 33 компонентов, состояния, адаптив, изображения, анимации, доступность с проверенными контрастами, правила использования (общие для сайта и админки).
- `docs/COMPONENT_SPECIFICATION.md` — реестр 33 компонентов, композиция всех страниц, матрица компонент × токены, обязательные состояния, правила вложенности, лимиты контента, do/don't.

### SEO decision (M2)

**React Router framework mode + SSR** для публичных страниц; админка — client-rendered за авторизацией. Обоснование и сравнение трёх вариантов — `ARCHITECTURE.md` §SEO & rendering; решение внесено в список Decisions. Причина: CMS-контент и мета-теги должны быть в HTML сразу и обновляться без пересборки (SSG этого не даёт).

### Reference pages status

- Все 14 URL из `page-sitemap.xml` отвечают 200 — недоступных (404/5xx) страниц нет.
- Без контента: `/prazdnik/` (пустая, `content.rendered: ""`), `/about/` (англоязычная заглушка Elementor).
- Сироты (нет в навигации): `/korporativ/`, `/den-rozhdeniya/`, `/romanticheskiy-uzhin/`, `/galereya/`, `/prazdnik/`, `/about/`.
- Мобильная вёрстка референса визуально не проверялась (нет браузера); выводы только по CSS-медиазапросам.

### Open questions from M1

- Цены, акции, телефон, email, мессенджеры, адрес, часы, реквизиты, вместимость, оборудование, возрастные правила — не подтверждены (полный список: `REFERENCE_AUDIT.md` §10).
- Юридические тексты (политика ПД, оферта, согласие) — нужен источник от заказчика.
- Канал уведомлений о заявках (email / Telegram / CRM) и SLA ответа.

### Open questions from M2

- **Шрифты:** M3 использует локальные variable-пакеты Playfair Display и Inter с SIL Open Font License. Кириллические glyph-файлы присутствуют и загружаются в браузере; визуальное решение по реальным финальным H1/H2 остаётся на проверку при создании страниц.
- **Контраст:** `#B66C50` как заливка кнопки даёт 4.0:1 с белым текстом и не проходит AA для обычного кегля, поэтому CTA использует `#8F4E37` (6.3:1). Нужно подтвердить, что затемнённая терракота принимается как цвет кнопок; альтернатива — терракота только для крупного текста и графики.
- **Айдентика:** логотип и фирменный стиль «ТИ-БОН» — сохраняются или редизайн? Без логотипа шапка/футер собираются на текстовом логотипе.
- **Фото:** главная использует временные иллюстрации Unsplash. Для публикации фото самой студии нужны материалы с подтверждёнными правами.
- **SSR-инфраструктура:** production SSR проверен локально; Node-контейнер в Docker deployment не проверен, Docker на машине не установлен.
- Перенумерация подтверждена: M2 — дизайн-система, каркас проекта — M3.

## Open items

- Docker is unavailable: Docker Compose / Nginx deployment cannot be verified until it is installed. The later deployment must include the Node SSR service.
- Python `python`/`pip` on PATH are broken; use `py -m pip` when backend work begins.
- Placeholder pages remain `noindex`; replace with approved content and page-specific SEO metadata before launch.
- Confirm the public domain and set `PUBLIC_SITE_ORIGIN` for the homepage canonical and absolute Open Graph URLs. Request submission is pending backend integration.

## Milestones

| # | Scope | State |
| --- | --- | --- |
| M0 | Environment, OpenCode config, docs skeleton | done |
| M1 | Reference audit & page specification (design docs) | done |
| M2 | Design system, component specification, SEO/rendering decision (docs only) | done |
| M3 | Frontend scaffold, SSR, shared UI foundations, token implementation, tests | done |
| M4 | Homepage design, content and browser verification | done |
| M5 | Next milestone | not started |
