// ── IMPORTANT ─────────────────────────────────────────────────────────
// Import from OUR fixtures file — loggedInPage handles login for us
import { test, expect } from '../fixtures/test-fixtures';

test.describe('Inventory Page — SAU-10', () => {

  // ── TC-006 — SAU-10 ─────────────────────────────────────────────────
  test('TC-006 — should add first product to cart',
    async ({ loggedInPage }) => {

    // loggedInPage fixture already logged us in
    // We land directly on the inventory page

    // ACT — add first product to cart
    await loggedInPage.addFirstProductToCart();

    // ASSERT — cart badge shows "1"
    await expect(loggedInPage.getCartBadge())
      .toHaveText('1');

    // ASSERT — verify product count still shows correctly
    const count = await loggedInPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

});