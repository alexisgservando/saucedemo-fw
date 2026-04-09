---
name: tc-generate-artifacts
description: Regenerate test artifact markdown files from Linear. Use when asked to generate artifacts, regenerate md files, update test cases, or sync with Linear.
---

Regenerate all .md test case files from Linear issues.

## Steps

1. Run this command:
```bash
   npx ts-node src/utils/generate-test-artifacts.ts
```

2. Confirm these files were created or updated:
   - src/test-artifacts/SAU-07-test-cases.md
   - src/test-artifacts/SAU-08-test-cases.md
   - src/test-artifacts/SAU-09-test-cases.md
   - src/test-artifacts/SAU-10-test-cases.md
   - src/test-artifacts/SAU-11-test-cases.md

3. Report any errors.

## Notes
- Reads from Linear API using LINEAR_API_KEY in .env
- Run whenever Linear issues are updated

## ⚠️ Ordering dependency
Always run /tc-notify-linear BEFORE this skill.

/tc-generate-artifacts reads Linear comments to build execution history in the .md files.
If /tc-notify-linear has not posted the latest results yet, the .md files will contain stale data.

Correct order:
/tc-run → /tc-report-qase → /tc-notify-linear → /tc-generate-artifacts

Use /tc-full-cycle to enforce this order automatically.