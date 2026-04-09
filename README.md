# SauceDemo QA Automation Framework

A next-generation, fully connected QA automation framework built with Playwright + TypeScript, powered by three AI agents working together to automate the entire testing lifecycle — from requirements to results.

**Repository:** [github.com/alexisgservando/saucedemo-fw](https://github.com/alexisgservando/saucedemo-fw)
**Application under test:** [saucedemo.com](https://www.saucedemo.com)
**Linear workspace:** [linear.app/saucedemo-qa](https://linear.app/saucedemo-qa)
**Qase project:** STA — SauceDemo Test Automation

---

## What this framework does

Starting from a written requirement in Linear, this framework:

1. **Reads requirements** from Linear and generates structured test cases automatically
2. **Syncs test cases** to Qase — no manual case creation needed
3. **Runs automated tests** with Playwright, capturing a screenshot per step as evidence
4. **Posts results** to both Qase (as a test run) and Linear (as a comment per issue)
5. **Runs in CI/CD** — every push to main triggers the full pipeline automatically

---

## The end-to-end pipeline

```
Requirement written in Linear
        ↓
Browser Claude reads it via MCP
        ↓
Test cases generated → posted to Linear as comments
        ↓
/tc-generate-artifacts → .md files synced to repo
        ↓
Engineer adds TC to test-data.ts + writes Playwright test
        ↓
/tc-sync-qase → Qase case created automatically
        ↓
/tc-run → tests execute, screenshots captured, summary.md written
        ↓
/tc-report-qase → results posted to Qase as new test run
        ↓
/tc-notify-linear → Qase results posted to Linear issues
```

---

## Tech stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev) | Test automation framework |
| [TypeScript](https://www.typescriptlang.org) | Type-safe test code |
| [Linear](https://linear.app) | Requirements and issue tracking |
| [Qase](https://qase.io) | Test case management and run history |
| [Claude AI](https://claude.ai) | Test case generation and Linear updates (browser) |
| [Claude Code](https://claude.ai/code) | Autonomous test execution (VS Code terminal) |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |

---

## The three agents

| Agent | Where it runs | What it does |
|-------|--------------|-------------|
| **Browser Claude** | claude.ai browser chat | Reads Linear requirements, generates test cases, posts results, plans work |
| **Claude Code** | VS Code terminal | Executes tests, runs skills, modifies files autonomously |
| **Playwright Reporter** | Background (every test run) | Captures screenshots, creates evidence folders, writes summary.md |

---

## Project structure

```
saucedemo-fw/
├── .claude/
│   └── skills/                    # Claude Code slash commands
│       ├── tc-run/SKILL.md
│       ├── tc-report-qase/SKILL.md
│       ├── tc-notify-linear/SKILL.md
│       ├── tc-generate-artifacts/SKILL.md
│       ├── tc-sync-qase/SKILL.md
│       └── tc-full-cycle/SKILL.md
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI/CD pipeline
├── src/
│   ├── fixtures/
│   │   └── test-fixtures.ts        # Playwright fixtures (dependency injection)
│   ├── pages/                      # Page Object Models
│   │   ├── BasePage.ts             # Base class — navigation + screenshots
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── tests/                      # Test spec files
│   │   ├── login.spec.ts           # TC-001 to TC-005
│   │   ├── inventory.spec.ts       # TC-006
│   │   └── checkout.spec.ts        # TC-007
│   ├── test-artifacts/             # Auto-generated .md files from Linear
│   │   ├── SAU-07-test-cases.md
│   │   ├── SAU-08-test-cases.md
│   │   ├── SAU-09-test-cases.md
│   │   ├── SAU-10-test-cases.md
│   │   └── SAU-11-test-cases.md
│   └── utils/
│       ├── test-data.ts            # Single source of truth — all TC mappings
│       ├── reporter.ts             # Custom Playwright reporter
│       ├── run-counter.ts          # Sequential run numbering
│       ├── notify-linear.ts        # Posts Qase results to Linear
│       ├── report-qase.ts          # Posts results to Qase on demand
│       ├── sync-qase-cases.ts      # Syncs TCs from test-data.ts to Qase
│       └── generate-test-artifacts.ts  # Syncs .md files from Linear API
├── evidence/                       # Local test runs (gitignored)
│   └── YYYY-MM-DD/
│       └── run-N/
│           ├── summary.md
│           └── screenshots/
│               ├── 01-login-page-opened.png
│               └── ...
├── CLAUDE.md                       # Claude Code project instructions
├── README.md
├── playwright.config.ts
├── qase.config.json
├── package.json
└── tsconfig.json
```

---

## Getting started

### Prerequisites

- Node.js v20+
- npm
- A [Linear](https://linear.app) account
- A [Qase](https://qase.io) account (free tier)

### Installation

```bash
git clone https://github.com/alexisgservando/saucedemo-fw.git
cd saucedemo-fw
npm install
npx playwright install chromium
```

### Configuration

Create a `.env` file in the root:

```
LINEAR_API_KEY=your_linear_api_key
QASE_TESTOPS_API_TOKEN=your_qase_api_token
```

Never commit this file — it is gitignored.

---

## Running tests

### Standard run (local)

```bash
npm test
```

### Run with Qase reporting

```bash
npm run test:qase
```

### Run headed (watch the browser)

```bash
npm run test:headed
```

### View HTML report

```bash
npm run report
```

---

## Claude Code skills

Launch Claude Code in the terminal:

```bash
claude
```

Then use any of these slash commands:

| Skill | Trigger phrase | What it does |
|-------|---------------|-------------|
| `/tc-run` | "run tests" | Run full Playwright suite + capture evidence |
| `/tc-report-qase` | "report to qase" | Post results to Qase on demand |
| `/tc-notify-linear` | "notify linear" | Post Qase results to Linear issues |
| `/tc-generate-artifacts` | "generate artifacts" | Sync .md files from Linear API |
| `/tc-sync-qase` | "sync qase cases" | Create missing Qase cases from test-data.ts |
| `/tc-full-cycle` | "run everything" | Run tests + notify Linear in one command |

---

## Test coverage

| Linear issue | Feature | Test cases | Qase cases |
|-------------|---------|------------|------------|
| SAU-7 | Login — valid credentials | TC-001 | STA-1 |
| SAU-8 | Login — invalid credentials | TC-002, TC-003, TC-004 | STA-2, STA-3, STA-4 |
| SAU-9 | Login — locked out user | TC-005 | STA-5 |
| SAU-10 | Add product to cart | TC-006 | STA-6 |
| SAU-11 | Complete checkout | TC-007 | STA-7 |

---

## Evidence structure

Every test run produces:

```
evidence/
└── 2026-04-08/
    └── run-1/
        ├── summary.md              # Full results table + Linear issue mapping
        └── screenshots/
            ├── 01-login-page-opened.png
            ├── 02-username-filled.png
            ├── 03-password-filled.png
            ├── 04-login-clicked.png
            ├── 05-product-added-to-cart.png
            ├── 06-cart-opened.png
            ├── 07-checkout-started.png
            ├── 08-shipping-info-filled.png
            ├── 09-order-summary.png
            └── 10-order-confirmed.png
```

Run folders increment sequentially (run-1, run-2, run-3...) and are never overwritten.

---

## Adding a new test case

When a new requirement is written in Linear:

1. Add the TC mapping to `src/utils/test-data.ts`:
```typescript
// In TC_TO_LINEAR
'TC-008': ['SAU-XX'],

// In LINEAR_ISSUES
{ id: 'SAU-XX', title: 'Your issue title', tcs: ['TC-008'] },

// In QASE_TO_TC
8: 'TC-008',
```

2. Run `/tc-sync-qase` in Claude Code — Qase case created automatically

3. Write the Playwright test with the new Qase ID:
```typescript
test('TC-008 — your test title', async ({ page }) => {
  qase.id(8); // ID returned by /tc-sync-qase
  // your test code
});
```

4. Run `/tc-full-cycle` — tests run, Qase updated, Linear notified

---

## CI/CD pipeline

The GitHub Actions pipeline runs automatically on every push to `main`:

```
Push to main
    ↓
Checkout repository
    ↓
Setup Node.js v22
    ↓
npm ci
    ↓
Install Chromium
    ↓
Run 7 tests (headless)
    ↓
Upload HTML report as artifact
    ↓
Upload evidence folder as artifact
    ↓
Results sent to Qase automatically
```

Required GitHub secrets: `LINEAR_API_KEY`, `QASE_TESTOPS_API_TOKEN`

---

## npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm test` | `playwright test --project=chromium` | Standard local run |
| `npm run test:all` | `playwright test` | All browsers |
| `npm run test:headed` | `playwright test --headed` | Watch the browser |
| `npm run test:qase` | `QASE_MODE=testops playwright test` | Run + send to Qase |
| `npm run report` | `playwright show-report` | Open HTML report |
| `npm run generate:artifacts` | `ts-node generate-test-artifacts.ts` | Sync .md from Linear |
| `npm run notify:linear` | `ts-node notify-linear.ts` | Post to Linear |
| `npm run report:qase` | `ts-node report-qase.ts` | Post to Qase |

---

## Linear integration

All requirements, test cases, and execution results are tracked in Linear at [linear.app/saucedemo-qa](https://linear.app/saucedemo-qa).

After every test run, `/tc-notify-linear` posts a comment to each affected Linear issue showing which test cases passed or failed, with a direct link to the Qase test run.

---

*Built with Playwright, TypeScript, Claude AI, Linear, Qase, and GitHub Actions.*