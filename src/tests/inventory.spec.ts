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

});