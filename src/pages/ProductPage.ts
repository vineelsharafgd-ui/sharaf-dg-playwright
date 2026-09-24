import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly page: Page;

  private readonly productTitle: Locator;
  private readonly addToCartButton: Locator;
  private readonly cartLink: Locator;

  private readonly addedToCartOffcanvas: Locator;
  private readonly offcanvasBackdrop: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productTitle = page.getByRole('heading', {
      name: /Apple iPhone 14 Pro.*256.*Silver/i,
    });

    this.addToCartButton = page.locator(
      'button.add_to_cart_button[data-product_id="4062543"]'
    );

    this.cartLink = page.getByTitle('View your shopping cart');

    this.addedToCartOffcanvas = page.locator(
      '#addedToCartOffcanvas'
    );

    this.offcanvasBackdrop = page.locator(
      '.offcanvas-backdrop'
    );
  }

  async openProduct(): Promise<void> {
    await this.page.bringToFront();

    await this.page.goto(
      '/product/apple-iphone-14-pro-256gb-silver-physical-dual-sim-international-version/?promo=2587484',
      {
        waitUntil: 'domcontentloaded',
      }
    );

    await expect(this.page).toHaveURL(
      /\/product\/apple-iphone-14-pro-256gb-silver-physical-dual-sim-international-version/
    );
  }

  async expectProductPageVisible(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.productTitle).toBeVisible({
      timeout: 15000,
    });

    await expect(this.addToCartButton).toBeVisible({
      timeout: 15000,
    });
  }

  async addToCart(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.addToCartButton).toBeVisible({
      timeout: 15000,
    });

    await expect(this.addToCartButton).toBeEnabled({
      timeout: 10000,
    });

    await this.addToCartButton.click();

    await expect(this.addedToCartOffcanvas).toHaveClass(
      /show/,
      {
        timeout: 10000,
      }
    ).catch(() => {});

    await this.page.waitForTimeout(1000);
  }

  private async closeAddedToCartPanel(): Promise<void> {
    await this.page.bringToFront();

    const isOpen = await this.addedToCartOffcanvas
      .evaluate((element) => {
        return element.classList.contains('show');
      })
      .catch(() => false);

    if (!isOpen) {
      return;
    }

    console.log('Closing Added to Cart panel...');

    await this.page.evaluate(() => {
      const offcanvas = document.querySelector(
        '#addedToCartOffcanvas'
      );

      if (!offcanvas) {
        return;
      }

      const closeButton =
        offcanvas.querySelector(
          '[data-bs-dismiss="offcanvas"]'
        ) ||
        offcanvas.querySelector(
          '.btn-close'
        ) ||
        offcanvas.querySelector(
          'button[aria-label="Close"]'
        );

      if (closeButton instanceof HTMLElement) {
        closeButton.click();
        return;
      }

      offcanvas.classList.remove('show');
      offcanvas.setAttribute('aria-hidden', 'true');
      offcanvas.removeAttribute('aria-modal');
      offcanvas.removeAttribute('role');

      document
        .querySelectorAll('.offcanvas-backdrop')
        .forEach((backdrop) => backdrop.remove());

      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    });

    await expect(this.offcanvasBackdrop).toHaveCount(0, {
      timeout: 5000,
    }).catch(() => {});

    await this.page.waitForTimeout(500);
  }

  async openCart(): Promise<void> {
    await this.page.bringToFront();

    await this.closeAddedToCartPanel();

    await expect(this.cartLink).toBeVisible({
      timeout: 15000,
    });

    await this.cartLink.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    ).catch(() => {});
  }
}