import { test, expect } from '../fixtures/test-fixtures';
import { qase } from 'playwright-qase-reporter';

test.describe('Inventory Page — SAU-10', () => {

  // TC-006 — SAU-10
  test('TC-006 — should add first product to cart',
    async ({ loggedInPage }) => {
      qase.id(6);
      qase.title('Add first product to cart');

      await loggedInPage.addFirstProductToCart();

      await expect(loggedInPage.getCartBadge())
        .toHaveText('1');

      const count = await loggedInPage.getProductCount();
      expect(count).toBeGreaterThan(0);
    });

  // TC-008 — SAU-48
  test('TC-008 — should sort products by price low to high',
    async ({ loggedInPage }) => {
      qase.id(8);
      qase.title('User can sort products by price low to high');

      await loggedInPage.sortBy('lohi');

      const prices = await loggedInPage.getProductPrices();
      expect(prices.length).toBeGreaterThan(0);

      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

});