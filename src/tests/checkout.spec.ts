import { test, expect } from '../fixtures/test-fixtures';

test.describe('Checkout — SAU-11', () => {

  // ── TC-007 — SAU-11 ─────────────────────────────────────────────────
  test('TC-007 — should complete full checkout process',
    async ({ loggedInPage, cartPage, checkoutPage }) => {

    // STEP 1 — Add product to cart
    await loggedInPage.addFirstProductToCart();

    // STEP 2 — Go to cart
    await loggedInPage.goToCart();

    // ASSERT — cart has items
    await expect(cartPage.getCartItems())
      .toHaveCount(1);

    // STEP 3 — Proceed to checkout
    await cartPage.proceedToCheckout();

    // STEP 4 — Fill shipping info
    await checkoutPage.fillShippingInfo('Test', 'User', '12345');

    // STEP 5 — Continue to order summary
    await checkoutPage.clickContinue();

    // STEP 6 — Finish order
    await checkoutPage.clickFinish();

    // ASSERT — confirmation message shown
    await expect(checkoutPage.getConfirmationTitle())
      .toHaveText('Thank you for your order!');
  });

});