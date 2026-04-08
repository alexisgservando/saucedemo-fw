---
name: tc-report-qase
description: Post test results to Qase on demand. Use when asked to report to qase, post results to qase, or send to qase. Works independently of the test run.
---

Post the latest test run results to Qase by creating a new test run via API.

## Steps

1. Run this command:
```bash
   npx ts-node src/utils/report-qase.ts
```

2. Wait for the script to complete.

3. Report:
   - Qase run ID created
   - Number of results posted (passed/failed)
   - Direct URL to the Qase run

## Notes
- Reads results from latest evidence/summary.md automatically
- Creates a brand new Qase test run — does not modify existing runs
- Works independently of QASE_MODE=testops
- Requires QASE_TESTOPS_API_TOKEN in .env