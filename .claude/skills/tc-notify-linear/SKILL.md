---
name: tc-notify-linear
description: Post test results to Linear issues. Use when asked to notify Linear, post results to Linear, update Linear, or notify issues.
---

Post the latest Qase test run results to the correct Linear issues.

## Steps

1. Run this command:
```bash
   npx ts-node src/utils/notify-linear.ts
```

   Or with a specific Qase run ID:
```bash
   npx ts-node src/utils/notify-linear.ts --run-id 5
```

2. Wait for the script to complete.

3. Report which Linear issues were notified:
   - SAU-7 (TC-001)
   - SAU-8 (TC-002, TC-003, TC-004)
   - SAU-9 (TC-005)
   - SAU-10 (TC-006)
   - SAU-11 (TC-007)

4. Confirm total results posted.

## Notes
- Without --run-id: reads the most recent Qase run automatically
- With --run-id N: reads that specific Qase run — use when you need to post results from a particular run
- Skill remains optional — not triggered automatically after every run
- Requires LINEAR_API_KEY and QASE_TESTOPS_API_TOKEN in .env

## When to use --run-id
Use --run-id when /tc-report-qase created a newer run after the real test run,
and you want Linear to reflect the actual CI results rather than the on-demand report.

Example: CI ran as run #3, then /tc-report-qase created run #4.
To post CI results: npx ts-node src/utils/notify-linear.ts --run-id 3