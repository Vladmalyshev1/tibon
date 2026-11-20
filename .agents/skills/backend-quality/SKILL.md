
---
name: Backend Quality
description: FastAPI, PostgreSQL, SQLAlchemy, migrations, API validation and backend security standards.
---

# Backend Quality Skill

Before implementation:
1. Read AGENTS.md.
2. Inspect existing models.
3. Inspect API contracts.
4. Inspect database migrations.

Implementation:
- Use Pydantic validation.
- Use SQLAlchemy 2 patterns.
- Use dependency injection.
- Keep business logic in services.
- Use UUID identifiers.
- Handle transactions.
- Validate uploaded files.
- Protect administrative endpoints.
- Hash passwords securely.
- Never expose secrets.

Verification:
- Run Ruff.
- Run Pytest.
- Check Alembic migrations.
- Test authorization.
- Test invalid requests.
- Test database constraints.

Never report a migration or test as successful without executing it.
