import { test as base, expect } from '@playwright/test';
import { LoginPage }     from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage }      from '../pages/CartPage';
import { CheckoutPage }  from '../pages/CheckoutPage';

// Define the shape of all our fixtures
type MyFixtures = {
  loginPage:     LoginPage;
  inventoryPage: InventoryPage;
  cartPage:      CartPage;
  checkoutPage:  CheckoutPage;
  loggedInPage:  InventoryPage;
};

export const test = base.extend<MyFixtures>({

  // ── loginPage fixture ──────────────────────────────────────────────
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // ── inventoryPage fixture ──────────────────────────────────────────
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  // ── cartPage fixture ───────────────────────────────────────────────
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  // ── checkoutPage fixture ───────────────────────────────────────────
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // ── loggedInPage fixture ───────────────────────────────────────────
  // Logs in first, then gives test a ready InventoryPage
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginWith('standard_user', 'secret_sauce');
    await use(new InventoryPage(page));
  },

});

export { expect };