IBON — AGENTS.md
1. Mission and standing instructions
Maintain and improve the existing TIBON culinary studio website. The website is a real application, not a static design prototype.

Work on the current user task only. This file provides lasting project-wide rules; it is not a milestone, a backlog, or permission to redesign unrelated pages. Do not require changes to this file before starting a new task.

The current explicit user request determines the permitted scope. When the user asks for a change to a route, component, text, workflow, design, API or backend behavior, that request authorizes the corresponding changes within its stated scope. Do not use older milestones or superseded documentation to block a new explicit task.
2. Instruction and source priority
For each task, resolve conflicts in this order:
1. The current explicit user request and its attached images/mockups.
2. Other user-approved design references specifically relevant to that task.
3. Verified business facts, existing production behavior, API contracts and security/privacy requirements (unless the current task explicitly changes them).
4. This AGENTS.md and the existing project architecture and conventions.
5. Historical documentation and older examples, which are context, not binding visual authority.
When a new request conflicts with existing behavior or a technical contract, implement the requested change coherently across affected layers if it is in scope; otherwise identify the dependency or blocker. Do not silently preserve outdated behavior or invent backend support. Ask only when an essential decision cannot safely be inferred.
3. Project architecture
- Frontend: React 19, TypeScript, Vite, React Router v7 Framework Mode with SSR; existing CSS/Tailwind setup, Framer Motion where already used, React Hook Form and Zod.
- Backend: Python, FastAPI, SQLAlchemy 2, PostgreSQL, Alembic and Pydantic.
- Integrations: Telegram notification worker and outbox, lead submission, protected PDF-menu download.
- Testing: Vitest, React Testing Library, Pytest, Playwright; existing build, lint and SSR checks.
Inspect actual configuration before relying on a version, command, path or library. Prefer existing patterns and dependencies. Do not upgrade dependencies or add abstractions without a concrete need. Keep routes, SSR, SEO, forms and integrations working unless the task explicitly changes them.
4. Approved visual language
Dark Cinematic Gastronomy is the default brand direction for all public-facing pages:
- Dark foundations: black #000000, graphite #151515, charcoal #222222; white/soft-gray typography; brand red #DD183B and deep red #CC1939.
- Elegant serif display typography and restrained sans-serif interface text. Consistent fluid type scales, spacing, content widths, buttons and shared navigation.
- Strong gastronomic photography, controlled warm lighting, depth and deliberate contrast; distinctive, page-appropriate compositions rather than generic templates.
- Responsive, accessible layouts; keyboard interaction, focus styles and prefers-reduced-motion.
Task-specific approved mockups are the primary visual target for the named pages. Inspect each relevant image and reproduce its structure, composition, proportions, typography, imagery, color and responsive intent as closely as practicable. Mockups do not authorize inventing business facts or replacing working UI with an image.

Default reference locations (use only those relevant to the current task):
- docs/references/chef-hero-reference.png — historical homepage header/hero reference.
- docs/references/site-concept.png — historical homepage-wide concept montage, not a literal two-column layout.
- docs/references/menu-reference.png — historical menu-page concept.
- docs/references/pages/ — subsequent page-specific approved mockups, when present.
Do not assume an old reference remains authoritative over a newer user request or over a newer approved implementation. If a page has no specific mockup, take its visual language from the latest approved, working site components. Do not independently switch to a light/cream editorial style or redesign approved pages without being asked.

Use authentic TIBON photos/logos where possible. Never treat generated people, locations, reviews or events as authentic. Do not use an entire mockup screenshot as a page background or as a replacement for semantic, functioning UI. Flag missing source assets and make the best honest implementation possible.
5. Start-of-task workflow
1. Inspect git status; preserve user changes. Identify the precise routes, components, assets, tests and contracts involved.
2. Read only relevant current files and any applicable design reference. Do not repeatedly scan the entire repository.
3. Discover and use installed, relevant skills and MCP tools when they materially help (e.g. frontend-design, UI/UX, accessibility, Playwright). Never claim a tool or skill was used if unavailable. Skills are advisory; explicit user-approved designs and product behavior take precedence.
4. Plan the smallest coherent implementation, including any necessary frontend/backend integration changes explicitly requested.
5. Implement changes in logical passes and inspect the resulting diff. Do not expand scope for unrelated cleanup.
6. Test changed behavior, then report exact results and remaining issues.
Use one primary agent by default. Delegate only independent work with clear file ownership; avoid multiple agents editing the same files and repetitive audits.
6. UI implementation and visual validation
For UI tasks:
- Reuse shared components/tokens where practical; keep header size, navigation, fonts and spacing consistent between routes.
- Preserve a page's distinctive composition when changing shared typography or controls.
- Use proper React/HTML elements, not flattened screenshots. Maintain meaningful alt text and accessible interaction.
- Avoid layout shifts from images/fonts; check fixed/sticky navigation and responsive cropping.
- Use the existing development server (npm run dev from frontend/) for hot reload when appropriate; do not unnecessarily start duplicate servers.
When a visual change is significant and browser tooling is available:
1. Run the actual site in Playwright or an available browser MCP.
2. Capture and inspect screenshots at 1440px desktop and 390px mobile on changed pages; check 320px, 768px and 1024px for overflow and layout problems.
3. Compare each page with its latest approved mockup, or, if none exists, with the approved site's shared visual language.
4. Fix significant differences, then recheck. Validate layout, headline wrapping, font loading, image crops, header consistency, contrast, focus, interaction and reduced motion.
5. Do not claim pixel-perfect fidelity or successful visual validation without inspecting the actual result. Describe remaining differences and missing assets.
For small text-only or backend-only changes, perform proportional, targeted checks rather than unnecessary full visual audits.
7. Functional integrity and privacy
- Preserve functional forms, validations, consent, lead persistence, Telegram outbox/worker and PDF delivery unless explicitly changed by the user.
- If a task changes a form's fields or purpose, trace the full flow: UI validation → API schema → database constraints/migration if necessary → notification content → automated tests. Do not send fake values to satisfy obsolete required fields.
- Send personal data to Telegram only through the established backend/worker, never from browser code with a bot token.
- Never fake successful submissions, messages or downloads. Distinguish a successfully saved lead from confirmed Telegram delivery.
- Keep .env, credentials, tokens, personal customer data and private PDFs out of Git and public assets. Avoid sensitive logging.
- Treat prices, contacts, schedules, operator/legal details, claims, photos and social links as verified data; do not invent or silently replace them.
- Drafted legal content requires verified facts and user/legal review; do not present it as approved legal advice.
- If preparing a public frontend-only demo, clearly separate nonfunctional demo interactions from live data collection.
8. Git and change safety
- Check git status before editing and inspect git diff when finished.
- Never discard unrelated user changes.
- Never run git reset --hard, git clean, force-push or destructive file operations without explicit approval.
- Do not automatically commit, amend, push, deploy or alter production systems unless the current user task explicitly requests it.
- Do not delete a working route, API, asset, dataset or integration unless explicitly requested. When removing a page, verify internal links, navigation, sitemap, SEO and appropriate 404/redirect behavior.
9. Quality gates
Choose checks proportionate to the actual changes. Run applicable ones, not merely list them:
- TypeScript / lint and relevant Vitest tests for frontend changes.
- Production build and SSR/hydration checks when public frontend behavior changes.
- Pytest and migration/integration checks when backend or data contracts change.
- Browser/Playwright checks for visual, responsive or interactive tasks.
- Regression checks for shared header/navigation, forms, menu PDF and approved pages affected by global styles.
Never claim a check passed if it was not run. Record any missing environment, unavailable MCP, disabled service or unverified production delivery.
10. Documentation and final report
Update only documentation materially affected by the task. Keep older documentation historical rather than allowing it to override approved current behavior. Do not generate long documents or milestone plans by default.

Finish with a concise report containing:
- What changed and which routes/files were affected.
- Tests/browser widths actually checked and whether they passed.
- Screenshots or comparison locations for significant visual tasks.
- Remaining discrepancies, missing assets or blockers.
Do not stop after one page if the current task explicitly asks to finish multiple pages. Conversely, do not edit additional pages just because they exist.