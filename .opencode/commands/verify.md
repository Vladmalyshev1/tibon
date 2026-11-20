---
description: Run project quality checks
agent: project-lead
---

Verify the current project state.

1. Inspect Git status.
2. Run frontend lint and tests if available.
3. Run TypeScript checks.
4. Run frontend production build.
5. Run backend lint and tests if available.
6. Check migrations.
7. Inspect errors.
8. Report actual results.

Do not skip unavailable checks silently.
Do not modify unrelated files.