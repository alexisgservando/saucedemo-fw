import { test, expect } from '../fixtures/test-fixtures';
import { qase } from 'playwright-qase-reporter';

test.describe('Checkout — SAU-11', () => {

  // TC-007 — SAU-11
  test('TC-007 — should complete full checkout process',
    async ({ loggedInPage, cartPage, checkoutPage }) => {
    qase.id(7);
    qase.title('Complete full checkout process');

    await loggedInPage.addFirstProductToCart();
    await loggedInPage.goToCart();

    await expect(cartPage.getCartItems()).toHaveCount(1);

    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo('Test', 'User', '12345');
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();

    await expect(checkoutPage.getConfirmationTitle())
      .toHaveText('Thank you for your order!');
  });

});