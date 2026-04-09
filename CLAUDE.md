# SauceDemo QA — Claude Code Instructions

## Project Overview
This is a Playwright + TypeScript test automation framework for SauceDemo.
It follows a Page Object Model architecture with Playwright fixtures.

## Tech Stack
- **Test framework:** Playwright + TypeScript
- **Test runner:** `npx playwright test`
- **Issue tracker:** Linear (workspace: saucedemo-qa)
- **API key:** stored in `.env` as `LINEAR_API_KEY`
- **Evidence:** `test-results/YYYY-MM-DD/run-{timestamp}/`

## Project Structure
src/
├── fixtures/        # Playwright fixtures (test.extend)
├── pages/           # Page Object Models
├── tests/           # Test spec files
├── test-artifacts/  # Auto-generated .md files per Linear issue
└── utils/           # Reporter, test data, generator script

## Linear Issues
| Issue | Title | Spec file |
|-------|-------|-----------|
| SAU-7 | User can log in with valid credentials | login.spec.ts |
| SAU-8 | User cannot log in with invalid credentials | login.spec.ts |
| SAU-9 | Locked out user cannot access the application | login.spec.ts |
| SAU-10 | User can add a product to the cart | inventory.spec.ts |
| SAU-11 | User can complete the checkout process | checkout.spec.ts |

---

## Skills

Skills are registered in `.claude/skills/` and available as slash commands.

| Command | Trigger phrase | Purpose |
|---------|---------------|---------|
| `/tc-run` | "run tests" | Run Playwright suite + capture evidence |
| `/tc-notify-linear` | "notify Linear" | Post results to Linear issues |
| `/tc-generate-artifacts` | "generate artifacts" | Regenerate .md files from Linear |
| `/tc-full-cycle` | "run everything" | Tests + evidence + Linear in one command |

## Workflow Dependencies

The correct execution order for a full QA cycle is:
/tc-run → /tc-report-qase → /tc-notify-linear → /tc-generate-artifacts

Each step depends on the previous:
- /tc-report-qase requires evidence from /tc-run
- /tc-notify-linear requires a Qase run from /tc-report-qase
- /tc-generate-artifacts requires Linear to be updated by /tc-notify-linear

Use /tc-full-cycle to run all 4 steps automatically in the correct order.

## Qase Reporting Paths

There are two ways results reach Qase — use only ONE per test execution:

| Path | When to use |
|------|------------|
| `npm run test:qase` or CI pipeline | Tests running with QASE_MODE=testops active |
| `/tc-report-qase` | Tests ran WITHOUT QASE_MODE=testops (e.g. plain /tc-run) |

⚠️ Running both paths for the same execution creates duplicate Qase runs.

/tc-full-cycle uses /tc-report-qase (not QASE_MODE=testops) — do not combine with npm run test:qase.