import { expect, type Locator, type Page } from '@playwright/test';

export class AccountDetailsPage {
  readonly page: Page;

  private readonly accountContainer: Locator;

  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly mobileNumberInput: Locator;
  private readonly emailInput: Locator;

  private readonly currentPasswordInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly confirmPasswordInput: Locator;

  private readonly saveButton: Locator;

  private readonly cookieBanner: Locator;
  private readonly searchInput: Locator;

  private readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.accountContainer = page.locator(
      '.woocommerce-MyAccount-content.account-container'
    );

    this.firstNameInput = page.locator(
      '#account_first_name'
    );

    this.lastNameInput = page.locator(
      '#account_last_name'
    );

    this.mobileNumberInput = page.locator(
      '#account_mobile_no'
    );

    this.emailInput = page.locator(
      '#account_email'
    );

    this.currentPasswordInput = page.locator(
      '#password_current'
    );

    this.newPasswordInput = page.locator(
      '#password_1'
    );

    this.confirmPasswordInput = page.locator(
      '#password_2'
    );

    this.saveButton = page.locator(
      'input[name="save_account_details"]'
    );

    this.cookieBanner = page.locator(
      '.cookies'
    );

    this.searchInput = page.locator(
      '#autocomplete-0-input'
    );

    this.successToast = page.locator(
      '.toast-msg.alert.alert-primary[role="alert"]'
    );
  }

  async expectPageLoaded(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.accountContainer).toBeVisible({
      timeout: 15000,
    });

    await expect(
      this.firstNameInput
    ).toBeVisible();

    await expect(
      this.emailInput
    ).toBeVisible();
  }

  async expectEmail(email: string): Promise<void> {
    await this.page.bringToFront();

    await expect(this.emailInput).toHaveValue(
      email
    );
  }

  async fillFirstName(
    firstName: string
  ): Promise<void> {
    await this.page.bringToFront();

    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(
    lastName: string
  ): Promise<void> {
    await this.page.bringToFront();

    await this.lastNameInput.fill(lastName);
  }

  async fillMobileNumber(
    mobileNumber: string
  ): Promise<void> {
    await this.page.bringToFront();

    await this.mobileNumberInput.fill(
      mobileNumber
    );
  }

  async fillAccountDetails(
    firstName: string,
    lastName: string,
    mobileNumber: string
  ): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillMobileNumber(mobileNumber);
  }

  async fillNewPassword(
    password: string
  ): Promise<void> {
    await this.page.bringToFront();

    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(
    password: string
  ): Promise<void> {
    await this.page.bringToFront();

    await this.confirmPasswordInput.fill(password);
  }

  async fillPassword(
    password: string
  ): Promise<void> {
    await this.fillNewPassword(password);
    await this.fillConfirmPassword(password);
  }

  async closeBlockingOverlays(): Promise<void> {
    await this.page.bringToFront();

    /*
     * The search input and cookie banner can sometimes
     * intercept the Save Changes button.
     *
     * Hide them only if they exist.
     */
    if (
      await this.searchInput
        .count()
        .catch(() => 0)
    ) {
      await this.searchInput.evaluate(
        (element) => {
          const container =
            element.closest(
              '.search, .search-wrapper, form'
            ) || element.parentElement;

          if (container instanceof HTMLElement) {
            container.style.pointerEvents =
              'none';
          }
        }
      ).catch(() => {});
    }

    if (
      await this.cookieBanner
        .count()
        .catch(() => 0)
    ) {
      await this.cookieBanner.evaluate(
        (element) => {
          if (element instanceof HTMLElement) {
            element.style.pointerEvents =
              'none';
          }
        }
      ).catch(() => {});
    }
  }

  async saveChanges(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.saveButton).toBeVisible({
      timeout: 10000,
    });

    await this.closeBlockingOverlays();

    await this.saveButton.scrollIntoViewIfNeeded();

    await this.saveButton.click({
      force: true,
    });
  }

  async expectAccountDetailsSaved(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.successToast).toBeVisible({
      timeout: 15000,
    });

    await expect(this.successToast).toContainText(
      'Account details changed successfully.'
    );
  }
}