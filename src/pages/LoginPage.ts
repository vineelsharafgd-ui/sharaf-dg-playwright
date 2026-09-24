import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  private readonly authDialog: Locator;
  private readonly emailInput: Locator;
  private readonly continueButton: Locator;
  private readonly otpInputs: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordLoginButton: Locator;
  private readonly securityError: Locator;
  private readonly incorrectPasswordError: Locator;
  private readonly lockedUserError: Locator;

  constructor(page: Page) {
    this.page = page;

    this.authDialog = page.locator(
      'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
    ).last();

    this.emailInput = this.authDialog.locator(
      '#sdg-email-input'
    );

    this.continueButton = this.authDialog.getByRole(
      'button',
      {
        name: 'Continue',
      }
    );

    this.otpInputs = this.authDialog.locator(
      '#sdg-otp-grid input'
    );

    this.passwordInput = this.authDialog.locator(
      '#sdg-pw-input'
    );

    this.passwordLoginButton = this.authDialog.getByRole(
      'button',
      {
        name: 'Log in',
      }
    );

    this.securityError = this.authDialog.locator(
      'p.sdg-p-err.sdg-auth-error[role="alert"]'
    );

    this.incorrectPasswordError = this.authDialog.locator(
      'p.sdg-p-err.sdg-auth-error[role="alert"]'
    );

    this.lockedUserError = this.authDialog.locator(
      'p.sdg-p-err.sdg-auth-error[role="alert"]'
    );
  }

  async expectLoginDialogVisible(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.authDialog).toBeVisible({
      timeout: 15000,
    });

    await expect(this.emailInput).toBeVisible({
      timeout: 10000,
    });
  }

  async enterEmail(email: string): Promise<void> {
    await this.page.bringToFront();

    await expect(this.emailInput).toBeVisible({
      timeout: 10000,
    });

    await this.emailInput.fill(email);
  }

  private async hasSecurityError(): Promise<boolean> {
    const error = this.page
      .locator(
        'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
      )
      .last()
      .locator(
        'p.sdg-p-err.sdg-auth-error[role="alert"]'
      );

    if (
      !(await error.isVisible().catch(() => false))
    ) {
      return false;
    }

    const text = (
      await error.innerText()
    ).trim();

    return text ===
      'Security error. Please try again.';
  }

  private async clickWithSecurityRetry(
    button: Locator,
    actionName: string,
    maxAttempts = 3
  ): Promise<void> {
    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      await expect(button).toBeVisible({
        timeout: 10000,
      });

      await expect(button).toBeEnabled({
        timeout: 10000,
      });

      await button.click();

      await this.page.waitForTimeout(1000);

      if (!(await this.hasSecurityError())) {
        return;
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `${actionName} failed after ${maxAttempts} attempts because of security errors.`
        );
      }

      console.log(
        `${actionName}: security error. Retrying ` +
        `(${attempt + 1}/${maxAttempts})...`
      );
    }
  }

  async continueWithEmail(
    maxAttempts = 3
  ): Promise<void> {
    await this.page.bringToFront();

    await this.clickWithSecurityRetry(
      this.continueButton,
      'Continue with email',
      maxAttempts
    );
  }

  async expectOtpScreenVisible(): Promise<void> {
    await this.page.bringToFront();

    const otpGrid = this.page
      .locator(
        'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
      )
      .last()
      .locator('#sdg-otp-grid');

    await expect(otpGrid).toBeVisible({
      timeout: 15000,
    });

    await expect(
      otpGrid.locator('input')
    ).toHaveCount(6);
  }

  private async fillOtpDigits(
    otp: string
  ): Promise<void> {
    if (!/^\d{6}$/.test(otp)) {
      throw new Error(
        `Invalid OTP "${otp}". Expected exactly 6 digits.`
      );
    }

    const inputs = this.page
      .locator(
        'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
      )
      .last()
      .locator('#sdg-otp-grid input');

    await expect(inputs).toHaveCount(6);

    for (
      let index = 0;
      index < 6;
      index++
    ) {
      await inputs
        .nth(index)
        .fill(otp[index]);
    }
  }

  async enterRegistrationOtp(
    otp: string,
    maxAttempts = 3
  ): Promise<void> {
    await this.page.bringToFront();

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      await this.expectOtpScreenVisible();

      console.log(
        `Entering registration OTP ` +
        `(attempt ${attempt}/${maxAttempts})...`
      );

      await this.fillOtpDigits(otp);

      await this.page.waitForTimeout(2000);

      if (await this.hasSecurityError()) {
        if (attempt === maxAttempts) {
          throw new Error(
            `Registration OTP security error persisted after ${maxAttempts} attempts.`
          );
        }

        console.log(
          `Registration OTP security error. ` +
          `Retrying (${attempt + 1}/${maxAttempts})...`
        );

        continue;
      }

      return;
    }

    throw new Error(
      'Unable to complete registration OTP verification.'
    );
  }

  async enterLoginOtp(
    otp: string,
    maxAttempts = 3
  ): Promise<void> {
    await this.page.bringToFront();

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      await this.expectOtpScreenVisible();

      console.log(
        `Entering login OTP ` +
        `(attempt ${attempt}/${maxAttempts})...`
      );

      await this.fillOtpDigits(otp);

      const securityError = this.page
        .locator(
          'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
        )
        .last()
        .locator(
          'p.sdg-p-err.sdg-auth-error[role="alert"]'
        );

      await Promise.race([
        this.page
          .waitForURL(
            'https://uae.sdgstage.com/',
            {
              timeout: 15000,
            }
          )
          .catch(() => null),

        expect(securityError)
          .toBeVisible({
            timeout: 15000,
          })
          .catch(() => null),
      ]);

      await this.page.waitForTimeout(1000);

      if (
        await securityError
          .isVisible()
          .catch(() => false)
      ) {
        const errorText = (
          await securityError.innerText()
        ).trim();

        if (
          errorText ===
          'Security error. Please try again.'
        ) {
          if (attempt === maxAttempts) {
            throw new Error(
              `Login OTP security error persisted after ${maxAttempts} attempts.`
            );
          }

          console.log(
            `Login OTP security error. ` +
            `Retrying (${attempt + 1}/${maxAttempts})...`
          );

          continue;
        }
      }

      return;
    }

    throw new Error(
      'Unable to complete login OTP verification.'
    );
  }

  async switchToPasswordLogin(): Promise<void> {
    await this.page.bringToFront();

    /*
     * Continue opens the OTP authentication screen.
     * Password login must therefore be selected from
     * the OTP screen.
     */
    await this.expectOtpScreenVisible();

    const visibleDialog = this.page
      .locator(
        'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
      )
      .last();

    /*
     * Find an interactive control in the OTP dialog
     * that offers password authentication.
     *
     * We intentionally do not hard-code one exact
     * wording because the site's authentication UI
     * can expose the option as a link/button.
     */
    const passwordLoginOption = visibleDialog
      .locator(
        'a, button, [role="button"]'
      )
      .filter({
        hasText: /password/i,
      })
      .first();

    await expect(passwordLoginOption).toBeVisible({
      timeout: 10000,
    });

    await passwordLoginOption.click();

    await expect(this.passwordInput).toBeVisible({
      timeout: 10000,
    });
  }

  async enterPassword(
    password: string
  ): Promise<void> {
    await this.page.bringToFront();

    await expect(this.passwordInput).toBeVisible({
      timeout: 10000,
    });

    await this.passwordInput.fill(password);
  }

  async clickPasswordLogin(
    maxAttempts = 3
  ): Promise<void> {
    await this.page.bringToFront();

    await this.clickWithSecurityRetry(
      this.passwordLoginButton,
      'Password login',
      maxAttempts
    );
  }

  async hasIncorrectPasswordError(): Promise<boolean> {
    await this.page.bringToFront();

    const error = this.page
      .locator(
        'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
      )
      .last()
      .locator(
        'p.sdg-p-err.sdg-auth-error[role="alert"]'
      );

    if (
      !(await error.isVisible().catch(() => false))
    ) {
      return false;
    }

    return (
      (await error.innerText()).trim() ===
      'Incorrect password. Try again.'
    );
  }

  async hasLockedUserError(): Promise<boolean> {
    await this.page.bringToFront();

    const error = this.page
      .locator(
        'div.sdg-popup-box[role="dialog"][aria-modal="true"]:visible'
      )
      .last()
      .locator(
        'p.sdg-p-err.sdg-auth-error[role="alert"]'
      );

    if (
      !(await error.isVisible().catch(() => false))
    ) {
      return false;
    }

    const text = (
      await error.innerText()
    ).trim()
      .toLowerCase();

    return (
      text.includes('user is locked') ||
      text.includes('account is locked') ||
      text.includes('locked')
    );
  }

  async loginWithPassword(
    email: string,
    password: string,
    maxAttempts = 3
  ): Promise<
    'success' |
    'incorrect-password' |
    'locked'
  > {
    await this.page.bringToFront();

    await this.expectLoginDialogVisible();

    await this.enterEmail(email);

    await this.continueWithEmail(
      maxAttempts
    );

    /*
     * Continue opens OTP authentication first.
     * Switch from OTP authentication to password
     * authentication before entering the password.
     */
    await this.switchToPasswordLogin();

    await this.enterPassword(password);

    await this.clickPasswordLogin(
      maxAttempts
    );

    await this.page.waitForTimeout(1500);

    if (
      await this.hasIncorrectPasswordError()
    ) {
      return 'incorrect-password';
    }

    if (
      await this.hasLockedUserError()
    ) {
      return 'locked';
    }

    return 'success';
  }
}