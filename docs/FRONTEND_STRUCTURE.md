# Frontend structure

Implementation map through M5.2. Stack and SEO decisions remain in `ARCHITECTURE.md`. Visual rules and component contracts are documented in `DESIGN_SYSTEM.md` and `COMPONENT_SPECIFICATION.md`.

## Project boundary

`frontend/` is an independent React Router v7 Framework Mode package. It owns the Vite config, lockfile, source, tests, and build output. The repository-root Playwright dependency remains available for existing project-level browser tooling. No backend or API client is implemented in M3.

## Source map

| Path | Responsibility |
| --- | --- |
| `app/root.tsx` | HTML document, metadata slots, scripts, shared public layout, top-level error boundary |
| `app/entry.server.tsx` | Streaming React SSR response |
| `app/entry.client.tsx` | Browser hydration with `HydratedRouter` |
| `app/routes.ts` | Explicit public routes and catch-all 404 route |
| `app/routes/` | Homepage, service and menu pages, and remaining scaffold routes |
| `app/layouts/` | Shared application layout |
| `app/components/layout/` | Main container, sections, footer |
| `app/components/navigation/` | Header, desktop/mobile navigation, mobile dialog menu, breadcrumbs |
| `app/components/ui/` | Shared controls, headings, containers, modal, photo rendering and gallery lightbox |
| `app/components/home/` | Homepage section compositions |
| `app/components/pages/` | Internal page compositions that accept content through props |
| `app/data/business.ts`, `app/data/menu.ts` | Shared contact, service and menu data with sources documented in `BUSINESS_DATA_SOURCES.md` |
| `app/lib/` | Shared route metadata and motion presets |
| `app/styles/app.css` | Font imports, M4.1 dark tokens, Tailwind theme and shared styles |
| `app/styles/pages.css` | Responsive styles for internal page compositions |
| `app/styles/services.css` | Service page layouts, menu lists and shared contact styling |
| `tests/` | Vitest component tests, internal composition fixture and production SSR/browser smoke test |
| `public/` | Static assets, including licensed illustrations documented for the homepage |

There is no `hooks/`, `types/`, or `utils/` directory yet because M3 has no feature requiring one. Add a directory with its first real module rather than creating placeholders.

## Routing and rendering

- Register every public page in `app/routes.ts` and give each route module its own metadata. `/contact/` is the requested URL; `/kontakty/` is also registered to match the M1 page specification.
- `root.tsx` wraps matched routes in `AppLayout`, which renders Header and Footer. Route errors render through the root error boundary; the wildcard route throws an HTTP 404.
- Internal scaffold routes retain their content and `noindex, nofollow` metadata. `PagePlaceholder` composes the text-only `PageHero` with breadcrumbs. The three adult format paths are nested under `/dlya-vzroslyh/`.
- Internal route modules can call `pageMeta({ title, description, noIndex })` from their `meta` export. Use `placeholderMeta` for scaffolds. Supply approved metadata when publishing a page.
- Load future CMS content in server `loader`s through a server-side FastAPI base URL. Do not expose private environment variables or server-only data to browser bundles. Keep API contracts in `docs/API.md` when the backend stage defines them.

## Design tokens and components

- `app/styles/app.css` defines the CSS custom properties and Tailwind v4 `@theme` mappings. `pages.css` uses the same semantic tokens.
- Keep primitives in `components/ui`, shared framing in `components/layout`, navigation in `components/navigation` and reusable internal compositions in `components/pages`.
- Use semantic HTML, visible focus, accessible names and touch targets from the design system. Honor `prefers-reduced-motion` for motion.
- Keep real contact data, photographs, and business claims out until supplied and approved.

## Development checks

Run from `frontend/`:

```text
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:ssr
```

`test:ssr` starts the production server, checks raw HTML and the HTTP 404, then launches Playwright to verify hydration, local font loading, and mobile/desktop navigation. Run it after `npm run build`.
