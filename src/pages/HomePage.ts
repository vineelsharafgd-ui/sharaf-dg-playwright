import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  private readonly signInLink: Locator;
  private readonly cartLink: Locator;

  private readonly accountDropdown: Locator;
  private readonly myAccountLink: Locator;
  private readonly accountDetailsLink: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signInLink = page.locator('a.top_login');

    this.cartLink = page.getByTitle(
      'View your shopping cart'
    );

    this.accountDropdown = page.locator(
      '.login-wrp.user .dropdown'
    );

    this.myAccountLink = page.locator(
      '.login-wrp.user a.my-account-link'
    );

    this.accountDetailsLink = page.locator(
      '.login-wrp.user .dropdown-menu a[href*="/my-account/edit-account/"]'
    );

    this.logoutLink = page.locator(
      '.login-wrp.user .dropdown-menu a[href*="/my-account/customer-logout/"]'
    );
  }

  async goto(): Promise<void> {
    await this.page.bringToFront();

    await this.page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    await expect(this.page).toHaveTitle(
      /Online Shopping \| Mobiles, Electronics & Appliances – Sharaf DG UAE/i
    );
  }

  async openLogin(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.signInLink).toBeVisible({
      timeout: 15000,
    });

    await this.signInLink.click();
  }

  async openCart(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.cartLink).toBeVisible({
      timeout: 15000,
    });

    await this.cartLink.click();
  }

  async expectHomePageVisible(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.signInLink).toBeVisible();
    await expect(this.cartLink).toBeVisible();
  }

  async expectLoggedIn(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.myAccountLink).toBeVisible({
      timeout: 20000,
    });
  }

  async openAccountDropdown(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.myAccountLink).toBeVisible({
      timeout: 20000,
    });

    await this.accountDropdown.hover();

    await expect(this.accountDetailsLink).toBeVisible({
      timeout: 10000,
    });
  }

  async openAccountDetails(): Promise<void> {
    await this.page.bringToFront();

    /*
     * After registration Sharaf DG lands on the
     * My Account dashboard. Open Account Details
     * directly instead of depending on the header
     * dropdown state.
     */
    await this.page.goto(
      '/my-account/edit-account/',
      {
        waitUntil: 'domcontentloaded',
      }
    );

    await expect(this.page).toHaveURL(
      /\/my-account\/edit-account\/?$/i,
      {
        timeout: 15000,
      }
    );
  }

  async logout(): Promise<void> {
    await this.page.bringToFront();

    await this.openAccountDropdown();

    await expect(this.logoutLink).toBeVisible({
      timeout: 10000,
    });

    await this.logoutLink.click();

    await this.page
      .waitForLoadState('domcontentloaded')
      .catch(() => {});

    await this.page.waitForTimeout(1500);
  }

  async expectLoggedOut(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.signInLink).toBeVisible({
      timeout: 20000,
    });

    await expect(this.myAccountLink).toHaveCount(0);
  }
}