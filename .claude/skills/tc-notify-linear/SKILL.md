---
name: tc-notify-linear
description: Post test results to Linear issues. Use when asked to notify Linear, post results to Linear, update Linear, or notify issues.
---

Post the latest test run results to the correct Linear issues.

## Steps

1. Run this command:
```bash
   npx ts-node src/utils/notify-linear.ts
```

2. Wait for the script to complete.

3. Report which issues were notified: SAU-7, SAU-8, SAU-9, SAU-10, SAU-11.

4. Confirm total results posted.

## Notes
- Reads latest run from evidence/ automatically
- Posts only relevant TCs to each issue
- Requires LINEAR_API_KEY in .env