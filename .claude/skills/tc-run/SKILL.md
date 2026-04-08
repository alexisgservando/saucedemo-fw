---
name: tc-run
description: Run the Playwright test suite for SauceDemo. Use when asked to run tests, execute tests, run the test suite, or run regression.
---

Run the full Playwright test suite and capture evidence.

## Steps

1. Run this command:
```bash
   npx playwright test --project=chromium
```

2. Wait for all tests to complete.

3. Report results as a formatted table showing TC, Spec, Title, Status, Duration.

4. Show the evidence folder path from the reporter output.

5. Show total: X/7 passed in Xs.

## Notes
- Evidence captured automatically in evidence/YYYY-MM-DD/run-N/
- Screenshots saved per step: 01 through 10
- summary.md generated automatically