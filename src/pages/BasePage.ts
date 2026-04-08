import { Page } from '@playwright/test';
import fs from 'fs';
import { getCurrentRunFolder } from '../utils/run-counter';

export class BasePage {
  protected readonly page: Page;
  private screenshotFolder: string;

  constructor(page: Page) {
    this.page = page;
    // Read run folder set by reporter — single source of truth
    const runFolder = process.env.RUN_FOLDER || getCurrentRunFolder();
    this.screenshotFolder = `${runFolder}/screenshots`;
    fs.mkdirSync(this.screenshotFolder, { recursive: true });
  }

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `${this.screenshotFolder}/${name}.png`,
      fullPage: true,
    });
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}