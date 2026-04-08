---
name: tc-full-cycle
description: Run the complete QA cycle — tests, evidence, and Linear notification. Use when asked to run everything, full cycle, or complete QA run.
---

Run the complete QA cycle: tests + evidence + Linear notification.

## Steps

1. Run the test suite:
```bash
   npx playwright test --project=chromium
```

2. Wait for all tests to complete.

3. Run the Linear notifier:
```bash
   npx ts-node src/utils/notify-linear.ts
```

4. Wait for notifications to complete.

5. Report full summary:
   - Test results table
   - Evidence folder path
   - Which Linear issues were notified
   - Final: X/7 passed in Xs — Linear updated ✅