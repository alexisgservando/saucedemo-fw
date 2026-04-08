---
name: tc-sync-qase
description: Sync test cases to Qase. Use when asked to sync qase cases, create qase cases, or sync test cases to qase. Ensures all TCs in test-data.ts exist in Qase project STA.
---

Sync all test cases from test-data.ts to Qase project STA.

## Steps

1. Run this command:
```bash
   npx ts-node src/utils/sync-qase-cases.ts
```

2. Wait for the script to complete.

3. Report:
   - How many cases already existed in Qase
   - How many new cases were created
   - The qase.id(N) annotations to add to spec files

## Notes
- Safe to run multiple times — will not create duplicates
- New cases are created in the correct suite (Login, Inventory, Checkout)
- Requires QASE_TESTOPS_API_TOKEN in .env