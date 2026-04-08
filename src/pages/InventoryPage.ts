import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {

    private readonly pageTitle: Locator;
    private readonly productItems: Locator;
    private readonly cartBadge: Locator;
    private readonly cartIcon: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.productItems = page.locator('[data-test="inventory-item"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
    }

    async addFirstProductToCart(): Promise<void> {
        await this.page
            .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
            .click();
        await this.takeScreenshot('05-product-added-to-cart');
    }

    async goToCart(): Promise<void> {
        await this.cartIcon.click();
        await this.takeScreenshot('06-cart-opened');
    }

    getPageTitle(): Locator {
        return this.pageTitle;
    }

    getCartBadge(): Locator {
        return this.cartBadge;
    }

    async getProductCount(): Promise<number> {
        return await this.productItems.count();
    }
}