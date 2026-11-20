
# TIBON PROJECT — GLOBAL INSTRUCTIONS

## Project goal

Build a modern, premium culinary studio website inspired by ti-bon.ru.

The project includes:
- Public multi-page website.
- Responsive design.
- FastAPI backend.
- PostgreSQL database.
- Admin dashboard / CMS.
- Lead management.
- SEO.
- Automated tests.
- Docker deployment.

## Architecture

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- React Hook Form
- Zod

Backend:
- Python
- FastAPI
- SQLAlchemy 2
- PostgreSQL
- Alembic
- Pydantic

Testing:
- Vitest
- React Testing Library
- Pytest
- Playwright

## Development rules

1. Read existing code before modifying it.
2. Never rewrite working modules without a reason.
3. Follow established architecture.
4. Avoid duplicated code.
5. Use strict TypeScript.
6. Validate all external input.
7. Keep secrets outside Git.
8. Never use mock data in production features.
9. Never leave unfinished TODO implementations.
10. Every feature must have verification.

## Agent coordination

Project Lead coordinates all specialists.

Frontend Developer owns frontend implementation.

Backend Developer owns backend implementation.

UI/UX Designer owns design documentation and design decisions.

QA Reviewer checks implementation and reports defects.

Avoid assigning two agents to edit the same files simultaneously.

Delegate independent tasks in parallel only when file ownership is clear.

## Git rules

- Commit after each verified milestone.
- Never use git reset --hard.
- Never discard user changes.
- Never force push.
- Never amend existing commits without permission.
- Inspect git diff before committing.
- Do not commit secrets or .env files.

## Quality gates

Before declaring a milestone complete:

1. Run relevant tests.
2. Run lint.
3. Run production build.
4. Inspect git diff.
5. Update documentation.
6. Report actual results.

Never claim tests passed unless they were executed.

## Communication

Work autonomously within the assigned scope.

Report:
- What was implemented.
- Files changed.
- Commands executed.
- Test results.
- Remaining issues.

Do not silently skip requirements.




## Token Efficiency Rules

The project must be developed with minimal unnecessary token usage.

### General rules
1. Do not repeat project requirements already documented in AGENTS.md or docs/.
2. Read only files relevant to the current task.
3. Never scan the entire repository unless explicitly required.
4. Do not reread files that have not changed.
5. Do not repeat large code blocks in reports.
6. Do not explain obvious implementation details.
7. Keep responses concise and technical.
8. Do not generate documentation unless it is useful or requested.
9. Avoid unnecessary abstractions, dependencies and boilerplate.
10. Do not perform repeated research when existing documentation is sufficient.

### Agent delegation
1. Use subagents only when they provide clear value.
2. Do not start multiple agents for simple tasks.
3. Do not delegate tasks that can be completed directly.
4. Parallelize only independent tasks.
5. Give each subagent a narrowly scoped task.
6. Require concise reports from subagents.
7. Do not ask agents to repeat repository analysis already completed.

### Development workflow
1. Implement one milestone at a time.
2. Before editing, inspect only relevant files.
3. Make focused changes instead of rewriting entire modules.
4. Run targeted tests first.
5. Run full tests only at milestone boundaries or before release.
6. Do not run the same command repeatedly without a reason.
7. Fix root causes instead of adding workarounds.

### Reporting
After each task report only:
- What was implemented.
- Files changed.
- Tests executed and results.
- Remaining blockers.

Avoid lengthy progress messages.

### Context management
1. Keep docs/PROJECT_STATUS.md updated with current project state.
2. Store important architecture decisions in docs/ARCHITECTURE.md.
3. Store API contracts in docs/API.md.
4. Use documentation instead of repeating project context in prompts.
5. If context is getting large, summarize completed work and continue from PROJECT_STATUS.md.




## Codex Workflow

### Project state
- M0 — completed.
- M1 — completed.
- M2 — completed (design system and SEO decision).
- M3 — completed (frontend application scaffold).
- M4 — completed (homepage).
- M5 — next milestone; do not start without explicit user approval.
- Do not repeat completed milestones.
- Always check docs/PROJECT_STATUS.md before starting work.

### Token efficiency
- Read only files relevant to the current task.
- Do not repeat information already documented.
- Do not scan the entire repository unnecessarily.
- Do not conduct repeated research.
- Do not launch subagents unless explicitly requested or clearly necessary.
- Prefer one agent working on one task.
- Keep reports concise.
- Avoid unnecessary dependencies and abstractions.

### Development rules
- Do not overwrite working code without a reason.
- Do not invent business information, prices or contact details.
- Do not use copyrighted images without permission.
- Keep documentation consistent with implementation.
- Do not claim tests passed without executing them.
- Do not commit unrelated changes.
- Never use destructive Git commands without approval.

### Current task
M4 — homepage is complete. Wait for explicit user approval before starting M5.

Read:
- docs/PROJECT_STATUS.md
- docs/ARCHITECTURE.md
- docs/REFERENCE_AUDIT.md
- docs/PAGE_SPECIFICATION.md

Do not repeat M0 or M1.
Do not start M5 without explicit user approval.
