# SAU-48 — User can sort products by price

**Linear:** https://linear.app/saucedemo-qa/issue/SAU-48/user-can-sort-products-by-price
**Project:** SauceDemo Test Automation
**Status:** Done

---

## User Story

As a logged-in user, I want to sort products by price so that I can find the cheapest or most expensive items quickly.

Acceptance Criteria:

* Given I am on the inventory page
* When I select "Price (low to high)" from the sort dropdown
* Then the products should be reordered with the lowest price first
* And the first product price should be less than or equal to the last product price

Notes for implementation:

* Sort dropdown is located at top right of inventory page
* Dropdown values: `az` (Name A-Z), `za` (Name Z-A), `lohi` (Price low to high), `hilo` (Price high to low)
* This will require a new method in `InventoryPage.ts`
* New test case `TC-008` to be added to `inventory.spec.ts`
* New suite needed in Qase: `Inventory` suite already exists (Suite ID 2)
* Run `/tc-sync-qase` after adding to `test-data.ts` to create Qase case automatically

---

## Test Cases

✅ COMPLETED — April 9, 2026

Full E2E QA workflow executed successfully for SAU-48. This was the first test of the updated workflow.

**What was built:**

`src/pages/InventoryPage.ts`:
- Added `sortBy(option)` method — selects sort option from dropdown with screenshots
- Added `getProductPrices()` method — reads all product prices as numbers

`src/tests/inventory.spec.ts`:
- Added TC-008 with `qase.id(8)` annotation
- Asserts prices are in ascending order after sorting

`src/utils/test-data.ts`:
- Added TC-008 to TC_TO_LINEAR, LINEAR_ISSUES
- QASE_TO_TC auto-updated by /tc-sync-qase

`src/utils/generate-test-artifacts.ts`:
- Added SAU-48 to ISSUES array
- SAU-48-test-cases.md generated

**Updated E2E workflow validated:**

Phase 1 — Requirement ✅ SAU-48 existed in Linear with AC
Phase 2 — Test case ✅ TC-008 generated, posted to Linear, Qase case STA-8 created via /tc-sync-qase, QASE_TO_TC auto-updated
Phase 3 — Execution ✅ 8/8 tests passed in 10.6s, evidence in run-3
Phase 4 — Qase ✅ Run #17 created via /tc-report-qase
Phase 5 — Linear ✅ SAU-48 notified with TC-008 results via /tc-notify-linear
Phase 6 — Docs ✅ SAU-48-test-cases.md generated via /tc-generate-artifacts

**Qase:** https://app.qase.io/run/STA/dashboard/17
**GitHub commit:** feat: add TC-008 — sort products by price (SAU-48)

---

TC-008 — User can sort products by price (low to high)

**Preconditions:**
- User is logged in as standard_user
- User is on the inventory page

**Steps:**
1. Observe the current order of product prices on the inventory page
2. Click the sort dropdown located at the top right of the inventory page
3. Select "Price (low to high)" from the dropdown options
4. Read all product prices displayed on the page

**Expected result:**
- Products are reordered after selection
- The first product price is less than or equal to the last product price
- All prices appear in ascending order

**Test data:**
- Sort dropdown value: "lohi"
- Sort options available: az (Name A-Z), za (Name Z-A), lohi (Price low-high), hilo (Price high-low)

**Linked spec:** src/tests/inventory.spec.ts
**Suite:** Inventory (Qase Suite ID: 2)

---

## Execution History

| Date | Type | Result | Executed by |
|------|------|--------|-------------|
| 2026-04-09 | Automated | ✅ PASSED | Playwright / Alexis Guardado |
| 2026-04-10 | Automated | ✅ PASSED | Playwright / Alexis Guardado |

---

## Evidence

Screenshots per step stored in:
`test-results/YYYY-MM-DD/run-{timestamp}/screenshots/`

_Generated automatically on 2026-04-10_