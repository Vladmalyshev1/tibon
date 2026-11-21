# TIBON PROJECT — AGENTS.md

## 1. Project Goal

Build a modern, premium culinary studio website inspired by https://ti-bon.ru/.

Project scope:
- Responsive multi-page website.
- SEO-friendly public pages with SSR.
- FastAPI backend and PostgreSQL database.
- Telegram notifications for saved leads.
- Lead management.
- Automated testing.
- Docker deployment.

Do not copy the reference website's code, content, or design verbatim.

## 2. Technology Stack

Frontend:
- React 19, TypeScript, Vite.
- React Router v7 Framework Mode with SSR.
- Tailwind CSS.
- Framer Motion.
- React Hook Form and Zod.

Backend:
- Python, FastAPI.
- SQLAlchemy 2, PostgreSQL.
- Alembic, Pydantic.

Testing:
- Vitest, React Testing Library.
- Pytest, Playwright.

Follow existing project versions and configuration. Do not upgrade dependencies without a reason.

## 3. Development Principles

1. Read `docs/PROJECT_STATUS.md` before starting a milestone.
2. Inspect relevant existing code before modifying it.
3. Follow `docs/ARCHITECTURE.md` and established conventions.
4. Reuse components and avoid duplication.
5. Use strict TypeScript and validate external input.
6. Keep secrets and environment files out of Git.
7. Do not invent business information, prices, contacts, reviews, or legal details.
8. Use temporary frontend content only when clearly identified as placeholder content.
9. Never simulate successful production operations without a real implementation.
10. Avoid unfinished functionality and unnecessary TODOs.
11. Preserve existing functionality unless the task explicitly requires changing it.
12. Implement only the assigned milestone.

## 4. Design and Content

Design requirements are defined in:
- `docs/DESIGN_SYSTEM.md`
- `docs/COMPONENT_SPECIFICATION.md`
- `docs/PAGE_SPECIFICATION.md`

M4.2 — Dark Cinematic Visual Alignment uses the approved **Dark Cinematic Gastronomy** direction. [Site concept](docs/references/site-concept.png) governs the homepage composition and visual rhythm. [Chef hero](docs/references/chef-hero-reference.png) governs the first screen and takes precedence over the hero pictured in the site concept. These are approved target compositions.

The current approved brief and its reference compositions take precedence over older visual rules. The homepage uses predominantly black, graphite and charcoal surfaces, cinematic food photography, large serif headings, white text and red accents. The desktop hero places the chef on the left and the large heading on the right, with a food close-up and dramatic lighting. Keep the dark composition when adapting it for phones. Never revert automatically to a light Premium Editorial theme. A change in direction requires explicit user approval.

Use licensed images and document their sources.

Preserve:
- Responsive behavior.
- Accessibility and keyboard navigation.
- Reduced-motion support.
- SSR and SEO.
- Existing routes and navigation.

Do not introduce a new design direction without an explicit task.

## 5. Agent Coordination

Use one main agent by default.

Subagents are optional and should be used only when:
- Tasks are genuinely independent.
- File ownership is clearly separated.
- Delegation provides meaningful value.

Do not assign multiple agents to modify the same files concurrently.

Avoid repeated repository analysis between agents.

## 6. Git Safety

1. Inspect `git status` before modifying files.
2. Never discard user changes.
3. Never use `git reset --hard` or `git clean` without explicit approval.
4. Never force push.
5. Never amend existing commits without permission.
6. Inspect `git diff` before finishing.
7. Never commit secrets or `.env` files.
8. Do not commit or push automatically unless the user explicitly requests it.
9. Keep milestone changes separate from unrelated modifications.

## 7. Quality Gates

Before declaring a milestone complete:

1. Run relevant targeted tests.
2. Run lint and TypeScript checks.
3. Run production build.
4. Verify SSR when public pages are affected.
5. Check responsive behavior when UI is affected.
6. For M4.2 implementation, capture desktop and mobile screenshots and compare the hero with the approved chef reference and the full homepage with the approved site concept. Record widths, screenshot paths and any deliberate mobile adaptations. The supplied compositions are desktop references.
7. Inspect Git diff.
8. Update relevant documentation.
9. Report actual results.

Never claim a test passed unless it was executed.

## 8. Token Efficiency

1. Read only files relevant to the task.
2. Do not repeatedly scan the repository.
3. Do not reread unchanged files without a reason.
4. Do not repeat project requirements already documented.
5. Reuse existing implementations.
6. Avoid unnecessary dependencies and abstractions.
7. Run targeted checks during implementation.
8. Run full checks at milestone boundaries.
9. Keep reports concise.
10. Do not print large source files in reports.
11. Store persistent decisions in documentation rather than repeating them in prompts.

## 9. Documentation

Maintain:
- `docs/PROJECT_STATUS.md` — milestone status and blockers.
- `docs/ARCHITECTURE.md` — architectural decisions.
- `docs/API.md` — backend contracts.
- `docs/DESIGN_SYSTEM.md` — current visual system.
- `docs/COMPONENT_SPECIFICATION.md` — UI components.

Update documentation only when implementation or decisions change.

## 10. Communication

Work autonomously within the approved scope.

Final report:
- Implemented changes.
- Important files changed.
- Tests executed and results.
- Remaining blockers.

Do not silently skip requirements.

## 11. Milestone Status

Completed:
- M0 — Project setup.
- M1 — Reference audit.
- M2 — Initial design system.
- M3 — Frontend scaffold.
- M4 — Homepage implementation.
- M4.1 — Dark Culinary Redesign.
- M5.1–M5.3 — Internal pages and public forms.
- M6.1–M6.3 — Backend, lead submission, and integration QA.
- M7 — Telegram Notifications and Menu Lead Capture.

Current:
- M4.2 — Dark Cinematic Visual Alignment. **In progress.** The current assignment is documentation only. Begin UI implementation only on a subsequent explicit assignment. Preserve architecture, API, backend, forms, routes and functional contracts.

Do not start future milestones without explicit user approval.
