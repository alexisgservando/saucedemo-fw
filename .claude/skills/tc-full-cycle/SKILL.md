---
name: tc-full-cycle
description: Run the complete E2E QA cycle. Use when asked to run everything, full cycle, or complete QA run. Runs tests, posts to Qase, updates Linear, and syncs documentation in the correct order.
---

Run the complete QA cycle in the correct dependency order.

## Steps

1. Run the Playwright test suite:
```bash
   npx playwright test --project=chromium
```
   Wait for all tests to complete and evidence to be captured.

2. Post results to Qase:
```bash
   npx ts-node src/utils/report-qase.ts
```
   Wait for the Qase run to be created and completed.

3. Post results to Linear (reads from Qase):
```bash
   npx ts-node src/utils/notify-linear.ts
```
   Wait for all Linear issues to be notified.

4. Sync .md documentation from Linear:
```bash
   npx ts-node src/utils/generate-test-artifacts.ts
```
   Wait for all 5 .md files to be regenerated.

5. Report full summary:
   - Test results table (TC, Spec, Title, Status, Duration)
   - Qase run URL
   - Which Linear issues were notified
   - Which .md files were updated
   - Final: X/7 passed — Qase ✅ — Linear ✅ — Docs ✅

## ⚠️ Important — Qase duplicate run warning
This skill runs /tc-report-qase (Step 2) to post results to Qase.
Do NOT also run `npm run test:qase` or use QASE_MODE=testops for the same test execution — this creates duplicate Qase runs.

Use this skill OR `npm run test:qase` — never both for the same run.

## Dependency order — do not change
Steps must run in this exact order:
1 → Evidence must exist before posting to Qase
2 → Qase run must exist before notifying Linear
3 → Linear must be updated before syncing .md files
4 → Always last