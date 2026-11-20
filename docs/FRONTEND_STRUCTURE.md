# Frontend structure

Implementation map for the M3 frontend scaffold. Stack and SEO decisions remain in `ARCHITECTURE.md`; visual rules and values remain in `DESIGN_SYSTEM.md` and `COMPONENT_SPECIFICATION.md`.

## Project boundary

`frontend/` is an independent React Router v7 Framework Mode package. It owns the Vite config, lockfile, source, tests, and build output. The repository-root Playwright dependency remains available for existing project-level browser tooling. No backend or API client is implemented in M3.

## Source map

| Path | Responsibility |
| --- | --- |
| `app/root.tsx` | HTML document, metadata slots, scripts, shared public layout, top-level error boundary |
| `app/entry.server.tsx` | Streaming React SSR response |
| `app/entry.client.tsx` | Browser hydration with `HydratedRouter` |
| `app/routes.ts` | Explicit public routes and catch-all 404 route |
| `app/routes/` | Page modules; currently structural placeholders with page-specific titles |
| `app/layouts/` | Shared application layout |
| `app/components/layout/` | Main container, sections, footer |
| `app/components/navigation/` | Header, desktop/mobile navigation, mobile dialog menu, breadcrumbs |
| `app/components/ui/` | Reusable buttons, icon button, headings, badge, accordion, tabs, modal, containers |
| `app/lib/` | Shared route metadata and motion presets |
| `app/styles/app.css` | Font imports, M2 design tokens, Tailwind theme, global and responsive component styles |
| `tests/` | Vitest/React Testing Library component tests and production SSR/browser smoke test |
| `public/` | Static assets served as-is; keep empty until approved assets are supplied |

There is no `hooks/`, `types/`, or `utils/` directory yet because M3 has no feature requiring one. Add a directory with its first real module rather than creating placeholders.

## Routing and rendering

- Register every public page in `app/routes.ts` and give each route module its own metadata. `/contact/` is the requested URL; `/kontakty/` is also registered to match the M1 page specification.
- `root.tsx` wraps matched routes in `AppLayout`, which renders Header and Footer. Route errors render through the root error boundary; the wildcard route throws an HTTP 404.
- Public route modules currently return structural placeholder content and `noindex, nofollow` metadata. Remove `noindex` only when a page has approved, production-ready content and SEO metadata.
- Load future CMS content in server `loader`s through a server-side FastAPI base URL. Do not expose private environment variables or server-only data to browser bundles. Keep API contracts in `docs/API.md` when the backend stage defines them.

## Design tokens and components

- `app/styles/app.css` is the source for the CSS custom properties and Tailwind v4 `@theme` mappings. Components use semantic tokens and shared classes; add new design values to M2 documentation before introducing them in code.
- Keep public component primitives in `components/ui`, shared framing in `components/layout`, navigation behavior in `components/navigation`, and page-only compositions beside their route unless reused.
- Use semantic HTML, visible focus, `aria-*` states, keyboard behavior, and touch targets from the M2 specifications. Honor `prefers-reduced-motion` for any motion added.
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
