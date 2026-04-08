import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {

  private readonly checkoutButton: Locator;
  private readonly cartItems:      Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems      = page.locator('[data-test="inventory-item"]');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.takeScreenshot('07-checkout-started');
  }

  getCartItems(): Locator {
    return this.cartItems;
  }
}