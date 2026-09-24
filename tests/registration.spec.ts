import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { HomePage } from '../src/pages/HomePage';
import { LoginPage } from '../src/pages/LoginPage';
import { AccountDetailsPage } from '../src/pages/AccountDetailsPage';
import { MailTmService } from '../src/services/MailTmService';

interface UserData {
  registration: {
    firstName: string;
    lastName: string;
    mobileNumber: string;
  };

  credentials: {
    password: string;
  };

  registeredEmails: string[];
}

const userDataPath = path.resolve(
  process.cwd(),
  'test-data/user.json'
);

function loadUserData(): UserData {
  return JSON.parse(
    fs.readFileSync(
      userDataPath,
      'utf-8'
    )
  ) as UserData;
}

function saveUserData(
  userData: UserData
): void {
  fs.writeFileSync(
    userDataPath,
    `${JSON.stringify(userData, null, 2)}\n`,
    'utf-8'
  );
}

test.describe('Sharaf DG Registration', () => {
  test.setTimeout(120000);

  test(
    'register new account with Mail.tm OTP',
    async ({ page }) => {
      const userData = loadUserData();

      const mailTm = new MailTmService();

      console.log('');
      console.log(
        '=============================================='
      );
      console.log('REGISTRATION');
      console.log(
        '=============================================='
      );

      const mailAccount =
        await mailTm.createAccount();

      console.log(
        `Mail.tm Email: ${mailAccount.email}`
      );

      console.log(
        `Mail.tm Password: ${mailAccount.password}`
      );

      expect(mailAccount.password).toBe(
        userData.credentials.password
      );

      const homePage =
        new HomePage(page);

      const loginPage =
        new LoginPage(page);

      const accountDetailsPage =
        new AccountDetailsPage(page);

      await test.step(
        'REGISTRATION - Open Sharaf DG',
        async () => {
          await homePage.goto();
        }
      );

      await test.step(
        'REGISTRATION - Open Create Account',
        async () => {
          await homePage.openLogin();

          await loginPage
            .expectLoginDialogVisible();

          const registerTab =
            page.getByRole('tab', {
              name: 'Create account',
            });

          await expect(
            registerTab
          ).toBeVisible();

          await registerTab.click();
        }
      );

      await test.step(
        'REGISTRATION - Enter Mail.tm email',
        async () => {
          await loginPage.enterEmail(
            mailAccount.email
          );
        }
      );

      await test.step(
        'REGISTRATION - Continue',
        async () => {
          await loginPage
            .continueWithEmail();
        }
      );

      await test.step(
        'REGISTRATION - Get OTP from Mail.tm',
        async () => {
          const otp =
            await mailTm.waitForOtp(
              mailAccount
            );

          console.log(
            `Registration OTP: ${otp}`
          );

          await loginPage
            .enterRegistrationOtp(otp);
        }
      );

      await test.step(
        'REGISTRATION - Open Account Details',
        async () => {
          /*
           * Registration finishes on the My Account
           * dashboard. Verify login first, then navigate
           * directly to Account Details.
           */
          await homePage.expectLoggedIn();

          await homePage
            .openAccountDetails();

          await accountDetailsPage
            .expectPageLoaded();
        }
      );

      await test.step(
        'REGISTRATION - Fill account details',
        async () => {
          await accountDetailsPage
            .expectPageLoaded();

          await accountDetailsPage
            .expectEmail(
              mailAccount.email
            );

          await accountDetailsPage
            .fillAccountDetails(
              userData.registration.firstName,
              userData.registration.lastName,
              userData.registration.mobileNumber
            );

         /* await accountDetailsPage
            .fillPassword(
              userData.credentials.password
            );*/
        }
      );

      await test.step(
        'REGISTRATION - Save account details',
        async () => {
          await accountDetailsPage
            .saveChanges();

          await accountDetailsPage
            .expectAccountDetailsSaved();
        }
      );

      await test.step(
        'REGISTRATION - Save registered email',
        async () => {
          if (
            !userData.registeredEmails.includes(
              mailAccount.email
            )
          ) {
            userData.registeredEmails.push(
              mailAccount.email
            );

            saveUserData(userData);
          }

          console.log('');

          console.log(
            `Registered email saved: ${mailAccount.email}`
          );

          console.log(
            `Total registered emails: ${userData.registeredEmails.length}`
          );
        }
      );

      console.log(
        '=============================================='
      );

      console.log(
        'REGISTRATION SUCCESS'
      );

      console.log(
        `Email: ${mailAccount.email}`
      );

      console.log(
        '=============================================='
      );

      console.log('');
    }
  );
});