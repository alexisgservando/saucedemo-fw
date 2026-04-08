# SauceDemo QA Automation Framework

A next-generation test automation framework built with Playwright + TypeScript, 
connected to Linear for requirements traceability and Claude AI for autonomous execution.

## Tech Stack

- **Playwright** — test automation
- **TypeScript** — type-safe test code
- **Linear** — requirements and issue tracking (via MCP)
- **Claude Code** — AI agent for autonomous test execution
- **Claude AI** — test case generation and Linear updates

## Project Structure
src/
├── fixtures/          # Playwright fixtures (dependency injection)
├── pages/             # Page Object Models
├── tests/             # Test spec files
├── test-artifacts/    # Auto-generated .md files per Linear issue
└── utils/             # Reporter, generator, notifier scripts

## Getting Started

### Prerequisites
- Node.js v20+
- npm

### Installation

```bash
npm install
npx playwright install
```

### Configuration

Create a `.env` file in the root:
LINEAR_API_KEY=your_linear_api_key

### Running Tests

```bash
# Run full suite
npx playwright test --project=chromium

# Or use Claude Code
claude
> /tc-run
```

### Claude Code Skills

| Command | Purpose |
|---------|---------|
| `/tc-run` | Run full test suite |
| `/tc-notify-linear` | Post results to Linear |
| `/tc-generate-artifacts` | Sync .md files from Linear |
| `/tc-full-cycle` | Run everything in one command |

## Test Coverage

| Linear Issue | Feature | Test Cases |
|-------------|---------|------------|
| SAU-7 | Login — valid credentials | TC-001 |
| SAU-8 | Login — invalid credentials | TC-002, TC-003, TC-004 |
| SAU-9 | Login — locked out user | TC-005 |
| SAU-10 | Add product to cart | TC-006 |
| SAU-11 | Complete checkout | TC-007 |

## Evidence

Each test run produces:

evidence/
└── YYYY-MM-DD/
└── run-N/
├── summary.md
└── screenshots/
├── 01-login-page-opened.png
└── ...

## Linear Integration

Requirements, test cases, and execution results are all tracked in Linear 
at [linear.app/saucedemo-qa](https://linear.app/saucedemo-qa).