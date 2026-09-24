import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;

  private readonly checkoutButton: Locator;
  private readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    this.checkoutButton = page.locator(
      'a.checkout-button[href*="/checkout/"]:visible'
    ).first();

    this.removeButtons = page.getByText('Remove', {
      exact: true,
    });
  }

  async expectCartPageVisible(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.page).toHaveURL(/\/cart/i, {
      timeout: 15000,
    });

    await expect(this.page.locator('body')).toContainText('Cart', {
      timeout: 10000,
    });
  }

  async clearCart(): Promise<void> {
    await this.page.bringToFront();

    let removeCount = await this.removeButtons.count();

    console.log(`Items currently in cart: ${removeCount}`);

    while (removeCount > 0) {
      await this.removeButtons.first().click();

      await this.page.waitForTimeout(1500);

      removeCount = await this.removeButtons.count();
    }

    console.log('Cart cleared.');
  }

  async expectProductInCart(): Promise<void> {
    await this.page.bringToFront();

    await expect(
      this.page.getByText(
        /Apple iPhone 14 Pro.*256.*Silver/i
      ).first()
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.checkoutButton).toBeVisible({
      timeout: 15000,
    });

    await expect(this.checkoutButton).toBeEnabled({
      timeout: 10000,
    });

    await this.checkoutButton.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    ).catch(() => {});

    await expect(this.page).toHaveURL(
      /\/checkout/i,
      {
        timeout: 20000,
      }
    );
  }
}