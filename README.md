# Sharaf DG UAE – Playwright Automation Framework

Playwright + TypeScript automation framework for testing the Sharaf DG UAE staging website.

**Application:** `https://uae.sdgstage.com`

## 1. Project Overview

This automation framework covers the following major flows:


* New customer registration
* Automated OTP retrieval using Mail.tm
* Account details update after registration
* OTP-based login
* Password-based login
* Authentication state persistence
* Product purchase flow
* Cart validation
* Checkout
* Shipping address handling
* Checkout.com payment handling
* Order confirmation validation

The framework follows the **Page Object Model (POM)** to keep page-specific locators and actions separate from test cases.

---

# 2. Technology Stack

* **Playwright**
* **TypeScript**
* **Node.js**
* **npm**
* **Mail.tm API** for disposable email accounts and OTP retrieval

---

# 3. Project Structure

```text
Sharaf DG/
│
├── src/
│   ├── pages/
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   ├── AccountDetailsPage.ts
│   │   ├── ProductPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   │
│   └── services/
│       └── MailTmService.ts
│
├── tests/
│   ├── registration.spec.ts
│   ├── login.spec.ts
│   └── purchase.spec.ts
│
├── test-data/
│   └── user.json
│
├── playwright/
│   └── .auth/
│       └── otp-user.json
│
├── test-results/
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

---

# 4. Setup Instructions

## 4.1 Prerequisites

Install the following before running the framework:

* Node.js
* npm
* Git

Verify the installations:

```bash
node --version
npm --version
git --version
```

Playwright browsers are also required.

---

## 4.2 Clone the Repository

Clone the project and navigate into the project directory:

```bash
git clone <repository-url>
cd "Sharaf DG"
```

---

## 4.3 Install Dependencies

Install all project dependencies:

```bash
npm install
```

Install the Playwright Chromium browser:

```bash
npx playwright install chromium
```

---

# 5. Test Data Configuration

Test data is maintained in:

```text
test-data/user.json
```

Example:

```json
{
  "registration": {
    "firstName": "Test",
    "lastName": "User",
    "mobileNumber": "+971501234567"
  },
  "credentials": {
    "password": "Playwright@12345"
  },
  "registeredEmails": []
}
```

## Test Data Usage

### Registration

The following values are read from `user.json`:

* First name
* Last name
* Mobile number
* Password

A new disposable Mail.tm email address is generated for every registration execution.

The generated email is appended to:

```json
"registeredEmails": []
```

after successful registration.

### Login

The login tests use the emails stored in:

```json
"registeredEmails"
```

This allows previously registered accounts to be reused.

---

# 6. Mail.tm

Registration uses Mail.tm to create a disposable email account and retrieve the Sharaf DG OTP automatically.

The framework creates a new Mail.tm account during registration.

The expected Mail.tm password is:

```text
Playwright@12345
```

The registration flow is:

```text
Create Mail.tm account
        ↓
Get disposable email
        ↓
Register on Sharaf DG
        ↓
Wait for Mail.tm OTP
        ↓
Enter OTP automatically
        ↓
Sharaf DG My Account dashboard
        ↓
Open Account Details
        ↓
Fill account information
        ↓
Set password
        ↓
Save account details
```

No manual OTP entry is required.

---

# 7. Authentication Storage State

The OTP login test saves the authenticated Playwright browser state to:

```text
playwright/.auth/otp-user.json
```

This storage state contains the authenticated session required by the purchase test.

The purchase test uses this existing state rather than performing login again.

This keeps the purchase flow independent from the login test.

---

# 8. Test Execution Instructions

## 8.1 Run All Tests

Run the complete test suite:

```bash
npx playwright test
```

The framework is configured to execute independent tests in parallel.

Example:

```text
Running 4 tests using 3 workers
```

The current test suite contains:

```text
Home
Registration
OTP Login
Password Login
Purchase
```

depending on the enabled test files/configuration.

---

# 9. Run a Specific Test File

## Home Page

```bash
npx playwright test tests/home.spec.ts
```

## Registration

```bash
npx playwright test tests/registration.spec.ts
```

## Login

```bash
npx playwright test tests/login.spec.ts
```

## Purchase

```bash
npx playwright test tests/purchase.spec.ts
```

---

# 10. Run Tests in Headed Mode

To see the browser while tests are executing:

```bash
npx playwright test --headed
```

For a specific test:

```bash
npx playwright test tests/login.spec.ts --headed
```

The framework does not depend on `page.pause()` or the Playwright Inspector.

---

# 11. Run with a Single Worker

For debugging an individual test, use:

```bash
npx playwright test tests/registration.spec.ts --workers=1
```

or:

```bash
npx playwright test tests/login.spec.ts --workers=1
```

This is intended for debugging only.

The framework is designed so that independent tests can run in parallel.

---

# 12. Test Execution Flow

## 12.1 Registration Test

The registration test performs:

```text
Open Sharaf DG
        ↓
Open Login
        ↓
Select Create Account
        ↓
Generate Mail.tm account
        ↓
Enter Mail.tm email
        ↓
Click Continue
        ↓
Retrieve OTP from Mail.tm
        ↓
Enter OTP
        ↓
Login/registration completes
        ↓
My Account dashboard
        ↓
Open Account Details
        ↓
Enter first name
        ↓
Enter last name
        ↓
Enter mobile number
        ↓
Set password
        ↓
Save
        ↓
Verify:
"Account details changed successfully."
        ↓
Save email to user.json
```

---

# 13. OTP Login

The OTP login test:

```text
Open Sharaf DG
        ↓
Open Login
        ↓
Enter registered email
        ↓
Continue
        ↓
Retrieve OTP
        ↓
Enter OTP
        ↓
Verify logged-in state
        ↓
Save Playwright storage state
```

Authentication state is saved to:

```text
playwright/.auth/otp-user.json
```

---

# 14. Password Login (Currently password login is not working, as there is a bug)
# Bug - After registration with OTP, unable to change the password. It is asking for the existing password which is not even created while regisration and flow itself is not available. Same thing is happening in production as well

The password login test uses an email from:

```text
test-data/user.json
```

The flow is:

```text
Open Login
        ↓
Enter registered email
        ↓
Continue
        ↓
OTP authentication screen
        ↓
Switch to password authentication
        ↓
Enter password
        ↓
Click Log in
        ↓
Verify login result
```

The test can distinguish between:

* Successful login
* Incorrect password
* Locked account

If an account is locked, the test can move to the next registered account.

---

# 15. Purchase Test

The purchase test uses:

```text
playwright/.auth/otp-user.json
```

so it starts with an authenticated session.

The purchase flow is:

```text
Open iPhone 14 Pro product
        ↓
Add product to cart
        ↓
Open cart
        ↓
Verify product exists in cart
        ↓
Proceed to checkout
        ↓
Select Home Delivery
        ↓
Check saved shipping addresses
        ↓
Use existing address if available
        ↓
Otherwise enter new address
        ↓
Select Checkout.com
        ↓
Use saved card if available
        ↓
Enter CVV
        ↓
Place order
        ↓
Checkout.com verification
        ↓
Verify order confirmation
```

The test does **not** require the cart quantity to be exactly one.

If the product already exists in the cart or the cart contains additional products, the test only verifies that the target product is present.

---

# 16. Shipping Address Assumption

If a saved shipping address exists during checkout:

```text
Saved shipping address found
        ↓
Use existing address
        ↓
Skip new-address entry
```

The test does not attempt to find a matching address when a saved address is already available.

If no saved address exists, the test enters the configured address.

Current address used for the new-address scenario:

```text
Burj Khalifa - 1 Sheikh Mohammed bin Rashid Blvd - Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates
```

---

# 17. Payment Assumption

The primary payment method is:

```text
Checkout.com
```

If a saved Checkout.com card exists, the test uses the saved card and enters its CVV.

The CVV used by the automated test must contain exactly three numeric digits.

Example:

```text
100
```

If no saved card is available, the framework can use the Checkout.com card-entry iframe flow.

---

# 18. Security Error Handling

Sharaf DG may occasionally display:

```text
Security error. Please try again.
```

The framework has reusable retry handling.

The maximum number of attempts is:

```text
3
```

Retry handling is applied to relevant authentication actions such as:

* Email → Continue
* Registration OTP
* Login OTP
* Password login

For OTP entry, the framework does not click a separate Verify button because Sharaf DG automatically submits after the sixth OTP digit.

---

# 19. Test Timeouts

Some Sharaf DG flows involve external systems such as:

* Mail.tm
* OTP generation
* Checkout.com
* Payment verification

Therefore, longer test timeouts are used for flows such as registration and purchase.

Registration currently uses:

```typescript
test.setTimeout(120000);
```

The purchase flow also uses an extended timeout because payment verification can take longer than a normal UI interaction.

---

# 20. Parallel Execution

The framework is designed to run independent tests in parallel.

For example:

```text
Worker 1 → OTP Login
Worker 2 → Registration
Worker 3 → Purchase
```

The purchase test does not depend on the OTP login test completing during the same run.

Instead, it uses the previously generated:

```text
playwright/.auth/otp-user.json
```

This allows the purchase test to execute independently.

Registration also creates a new Mail.tm account, so it does not depend on the login test.

---

# 21. Assumptions Made

The framework currently makes the following assumptions.

### Application

* The Sharaf DG UAE staging environment is available.
* The application URL remains:
  `https://uae.sdgstage.com`
* The relevant authentication and checkout UI remains available.

### Registration

* Mail.tm is available for creating disposable email accounts.
* Sharaf DG sends the registration OTP to the Mail.tm inbox.
* OTPs are six digits.
* Sharaf DG automatically submits OTP after the sixth digit.
* The registration flow lands on the My Account dashboard after successful OTP verification.
* Account Details is available at:
  `/my-account/edit-account/`

### Login

* Registered emails are maintained in `test-data/user.json`.
* The configured password is valid for the registered accounts.
* Sharaf DG may initially present OTP authentication after Continue.
* Password authentication can be selected from the OTP authentication screen.
* Locked accounts can be skipped in favor of another registered account.

### Purchase

* `playwright/.auth/otp-user.json` contains a valid authenticated session.
* The target iPhone product is available.
* The product can be added to the cart.
* Home Delivery is available.
* A saved shipping address may already exist.
* Checkout.com is available as a payment method.
* A saved Checkout.com card may already exist.
* The saved card's CVV is available to the test.
* Checkout.com verification eventually redirects to the order confirmation page.

### Test Environment

* Tests are executed against the staging environment.
* Test accounts are disposable/test accounts.
* The framework does not use production customer accounts.
* External services such as Mail.tm and Checkout.com may introduce additional execution time.

---

# 22. Reports and Debugging

After a test failure, Playwright stores artifacts under:

```text
test-results/
```

Depending on the Playwright configuration, these can include:

* Screenshots
* Videos
* Error context
* Trace files

For example:

```text
test-results/
└── login-.../
    ├── test-failed-1.png
    ├── video.webm
    └── error-context.md
```

These artifacts can be used to investigate locator and application-state failures.

---

# 23. Useful Commands

### Install dependencies

```bash
npm install
```

### Install Chromium

```bash
npx playwright install chromium
```

### Run all tests

```bash
npx playwright test
```

### Run headed

```bash
npx playwright test --headed
```

### Run one test file

```bash
npx playwright test tests/login.spec.ts
```

### Run with one worker

```bash
npx playwright test tests/registration.spec.ts --workers=1
```

### Run a specific test by title

```bash
npx playwright test -g "login with OTP"
```

### Show the HTML report

```bash
npx playwright show-report
```

### List available tests

```bash
npx playwright test --list
```

---

# 24. Important Files

| File                              | Purpose                          |
| --------------------------------- | -------------------------------- |
| `tests/home.spec.ts`              | Home page tests                  |
| `tests/registration.spec.ts`      | New account registration         |
| `tests/login.spec.ts`             | OTP and password login           |
| `tests/purchase.spec.ts`          | Product purchase and checkout    |
| `src/pages/HomePage.ts`           | Home/account navigation          |
| `src/pages/LoginPage.ts`          | Authentication flows             |
| `src/pages/AccountDetailsPage.ts` | Account information              |
| `src/pages/ProductPage.ts`        | Product and cart actions         |
| `src/pages/CartPage.ts`           | Cart operations                  |
| `src/pages/CheckoutPage.ts`       | Shipping, payment and order      |
| `src/services/MailTmService.ts`   | Mail.tm account and OTP handling |
| `test-data/user.json`             | Registration and login test data |
| `playwright/.auth/otp-user.json`  | Persisted authenticated session  |
| `playwright.config.ts`            | Playwright configuration         |

---

# 25. Recommended Execution

For a normal full regression run:

```bash
npx playwright test
```

For visible browser execution:

```bash
npx playwright test --headed
```

After execution, open the report:

```bash
npx playwright show-report
```

The preferred execution mode is the normal parallel run because the registration, login and purchase flows are intentionally designed to operate independently.
