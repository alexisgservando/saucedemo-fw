import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {

    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;ß
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async open(): Promise<void> {
        await this.navigate('/');
        await this.usernameInput.waitFor({ state: 'visible' });
        await this.takeScreenshot('01-login-page-opened');
    }

    async fillUsername(username: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.takeScreenshot('02-username-filled');
    }

    async fillPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
        await this.takeScreenshot('03-password-filled');
    }

    async clickLogin(): Promise<void> {
        await this.loginButton.click();
        await this.takeScreenshot('04-login-clicked');
    }

    async loginWith(username: string, password: string): Promise<void> {
        await this.open();
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.clickLogin();
    }

    getErrorMessage(): Locator {
        return this.errorMessage;
    }
}