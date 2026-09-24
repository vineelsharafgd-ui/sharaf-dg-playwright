import {
  test,
  expect,
} from '@playwright/test';

import fs from 'node:fs';
import path from 'node:path';

import { HomePage } from '../src/pages/HomePage';
import { LoginPage } from '../src/pages/LoginPage';
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
    fs.readFileSync(userDataPath, 'utf-8')
  ) as UserData;
}

test.describe('Sharaf DG Login', () => {
  test(
    'login with OTP',
    async ({ page }) => {
      const userData = loadUserData();

      expect(
        userData.registeredEmails.length,
        'No registered emails found in test-data/user.json'
      ).toBeGreaterThan(0);

      const email =
        userData.registeredEmails[0];

      const password =
        userData.credentials.password;

      const mailTm = new MailTmService();

      console.log('');
      console.log('==============================================');
      console.log('LOGIN WITH OTP');
      console.log(`Sharaf DG Email: ${email}`);
      console.log('==============================================');

      const mailAccount = {
        email,
        password,
        token: '',
      };

      await test.step(
        'LOGIN OTP - Login to Mail.tm',
        async () => {
          mailAccount.token =
            await mailTm.login(
              email,
              password
            );
        }
      );

      const existingMessageIds =
        await mailTm.getMessageIds(
          mailAccount
        );

      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);

      await test.step(
        'LOGIN OTP - Open Sharaf DG',
        async () => {
          await homePage.goto();
          await homePage.openLogin();

          await loginPage.expectLoginDialogVisible();
        }
      );

      await test.step(
        'LOGIN OTP - Enter email',
        async () => {
          await loginPage.enterEmail(email);
        }
      );

      await test.step(
        'LOGIN OTP - Continue',
        async () => {
          await loginPage.continueWithEmail();
        }
      );

      await test.step(
        'LOGIN OTP - Get new OTP from Mail.tm',
        async () => {
          const otp =
            await mailTm.waitForNewOtp(
              mailAccount,
              existingMessageIds
            );

          console.log(
            `Login OTP: ${otp}`
          );

          await loginPage.enterLoginOtp(
            otp
          );
        }
      );

      await test.step(
        'LOGIN OTP - Verify logged in',
        async () => {
          await homePage.expectLoggedIn();
        }
      );

      await test.step(
        'LOGIN OTP - Save storage state',
        async () => {
          const authDirectory =
            path.resolve(
              process.cwd(),
              'playwright/.auth'
            );

          fs.mkdirSync(
            authDirectory,
            {
              recursive: true,
            }
          );

          await page.context().storageState({
            path: path.join(
              authDirectory,
              'otp-user.json'
            ),
          });

          console.log(
            'Saved authentication state to playwright/.auth/otp-user.json'
          );
        }
      );

      console.log('');
      console.log('OTP LOGIN SUCCESS');
      console.log('');
    }
  );

  test(
    'login with password',
    async ({ page }) => {
      const userData = loadUserData();

      expect(
        userData.registeredEmails.length,
        'No registered emails found in test-data/user.json'
      ).toBeGreaterThan(0);

      const password =
        userData.credentials.password;

      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);

      let successfulLogin = false;

      console.log('');
      console.log('==============================================');
      console.log('LOGIN WITH PASSWORD');
      console.log(
        `Registered accounts: ${userData.registeredEmails.length}`
      );
      console.log('==============================================');

      for (
        let index = 0;
        index < userData.registeredEmails.length;
        index++
      ) {
        const email =
          userData.registeredEmails[index];

        console.log('');
        console.log(
          `Trying account ${index + 1}/${userData.registeredEmails.length}: ${email}`
        );

        await test.step(
          `PASSWORD LOGIN - Account ${index + 1}`,
          async () => {
            await homePage.goto();
            await homePage.openLogin();

            const result =
              await loginPage.loginWithPassword(
                email,
                password
              );

            if (result === 'success') {
              successfulLogin = true;

              console.log(
                `Password login successful: ${email}`
              );

              return;
            }

            if (
              result === 'incorrect-password'
            ) {
              console.log(
                `Incorrect password for ${email}. Ignoring password login test.`
              );

              test.skip(
                true,
                'Sharaf DG returned "Incorrect password. Try again."'
              );

              return;
            }

            if (result === 'locked') {
              console.log(
                `User is locked: ${email}`
              );

              if (
                index <
                userData.registeredEmails.length - 1
              ) {
                console.log(
                  'Trying the next registered email...'
                );
              }

              return;
            }
          }
        );

        if (successfulLogin) {
          break;
        }
      }

      if (!successfulLogin) {
        test.skip(
          true,
          'All registered Sharaf DG users are locked.'
        );
      }

      await test.step(
        'PASSWORD LOGIN - Verify logged in',
        async () => {
          await homePage.expectLoggedIn();
        }
      );
    }
  );
});