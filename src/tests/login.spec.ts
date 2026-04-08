// ── IMPORTANT ─────────────────────────────────────────────────────────
// We import from OUR fixtures file — not from '@playwright/test'
// This gives us loginPage and inventoryPage automatically
import { test, expect } from '../fixtures/test-fixtures';
import { USERS, MESSAGES } from '../utils/test-data';

test.describe('Login Page — SAU-7, SAU-8, SAU-9', () => {

    // ── TC-001 — SAU-7 ──────────────────────────────────────────────────
    test('TC-001 — should login successfully with valid credentials',
        async ({ loginPage, inventoryPage }) => {

            // ACT — loginPage fixture provides a ready LoginPage object
            await loginPage.loginWith(
                USERS.standard.username,
                USERS.standard.password
            );

            // ASSERT — auto-waiting: Playwright retries until pass or timeout
            await expect(inventoryPage.getPageTitle())
                .toHaveText('Products');

            // Verify products are visible
            const count = await inventoryPage.getProductCount();
            expect(count).toBeGreaterThan(0);
        });

    // ── TC-002 — SAU-8 ──────────────────────────────────────────────────
    test('TC-002 — should show error with invalid credentials',
        async ({ loginPage }) => {

            await loginPage.loginWith(
                USERS.invalid.username,
                USERS.invalid.password
            );

            await expect(loginPage.getErrorMessage())
                .toBeVisible();
            await expect(loginPage.getErrorMessage())
                .toContainText(MESSAGES.invalidCreds);
        });

    // ── TC-003 — SAU-8 ──────────────────────────────────────────────────
    test('TC-003 — should show error when username is empty',
        async ({ loginPage }) => {

            await loginPage.open();
            await loginPage.fillPassword(USERS.standard.password);
            await loginPage.clickLogin();

            await expect(loginPage.getErrorMessage())
                .toContainText(MESSAGES.usernameRequired);
        });

    // ── TC-004 — SAU-8 ──────────────────────────────────────────────────
    test('TC-004 — should show error when password is empty',
        async ({ loginPage }) => {

            await loginPage.open();
            await loginPage.fillUsername(USERS.standard.username);
            await loginPage.clickLogin();

            await expect(loginPage.getErrorMessage())
                .toContainText(MESSAGES.passwordRequired);
        });

    // ── TC-005 — SAU-9 ──────────────────────────────────────────────────
    test('TC-005 — should show error for locked out user',
        async ({ loginPage }) => {

            await loginPage.loginWith(
                USERS.locked.username,
                USERS.locked.password
            );

            await expect(loginPage.getErrorMessage())
                .toBeVisible();
            await expect(loginPage.getErrorMessage())
                .toContainText(MESSAGES.lockedOut);
        });

});