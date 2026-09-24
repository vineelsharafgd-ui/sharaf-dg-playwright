import { expect, type Locator, type Page } from '@playwright/test';

export class YopmailPage {
  readonly page: Page;

  private readonly refreshButton: Locator;
  private readonly inboxFrame: Locator;
  private readonly mailFrame: Locator;

  constructor(page: Page) {
    this.page = page;

    this.refreshButton = page.locator('#refresh');
    this.inboxFrame = page.locator('#ifinbox');
    this.mailFrame = page.locator('#ifmail');
  }

  async bringToFront(): Promise<void> {
    await this.page.bringToFront();
  }

  async goto(email: string): Promise<void> {
    await this.bringToFront();

    const username = email.split('@')[0];

    await this.page.goto(
      `https://yopmail.com/?login=${username}`,
      {
        waitUntil: 'domcontentloaded',
      }
    );

    await this.page.waitForTimeout(2000);
  }

  async openInbox(email: string): Promise<void> {
    await this.goto(email);

    await expect(
      this.page.locator('#login')
    ).toHaveValue(
      email.split('@')[0]
    );
  }

  async refreshInbox(): Promise<void> {
    await this.bringToFront();

    await expect(
      this.refreshButton
    ).toBeVisible();

    await this.refreshButton.click();

    await this.page.waitForTimeout(2000);
  }

  async getInboxFrame(): Promise<ReturnType<Locator['contentFrame']>> {
    const frame = this.inboxFrame.contentFrame();

    if (!frame) {
      throw new Error(
        'Yopmail inbox iframe is not available.'
      );
    }

    return frame;
  }

  async getLatestEmail(): Promise<Locator> {
    const frame = await this.getInboxFrame();

    await expect(
      frame.locator('body')
    ).toBeVisible();

    const emailRows = frame.locator('.m');

    const count = await emailRows.count();

    if (count === 0) {
      throw new Error(
        'No emails found in the Yopmail inbox.'
      );
    }

    return emailRows.first();
  }

  async openLatestEmail(): Promise<void> {
    await this.bringToFront();

    const latestEmail =
      await this.getLatestEmail();

    await latestEmail.click();

    await this.page.waitForTimeout(1500);

    await expect(
      this.mailFrame
    ).toHaveAttribute(
      'state',
      'full'
    );
  }

  async getOtpFromLatestEmail(): Promise<string> {
    const mailFrame =
      this.mailFrame.contentFrame();

    if (!mailFrame) {
      throw new Error(
        'Yopmail email iframe is not available.'
      );
    }

    await expect(
      mailFrame.locator('body')
    ).toBeVisible();

    const emailBody =
      await mailFrame
        .locator('body')
        .innerText();

    console.log(
      `Yopmail email content:\n${emailBody}`
    );

    const otpMatch =
      emailBody.match(/\b\d{6}\b/);

    if (!otpMatch) {
      throw new Error(
        `6-digit OTP was not found in the email.\n\n${emailBody}`
      );
    }

    return otpMatch[0];
  }

  async getLatestOtp(): Promise<string> {
    await this.refreshInbox();

    await this.openLatestEmail();

    return await this.getOtpFromLatestEmail();
  }

  async waitForOtp(
    timeout = 30000
  ): Promise<string> {
    const startTime = Date.now();

    while (
      Date.now() - startTime < timeout
    ) {
      try {
        const otp =
          await this.getLatestOtp();

        if (/^\d{6}$/.test(otp)) {
          return otp;
        }
      } catch {
        console.log(
          'OTP not available yet. Refreshing Yopmail...'
        );
      }

      await this.page.waitForTimeout(2000);
    }

    throw new Error(
      `OTP was not received within ${timeout}ms`
    );
  }

  async close(): Promise<void> {
    await this.page.close();
  }
}