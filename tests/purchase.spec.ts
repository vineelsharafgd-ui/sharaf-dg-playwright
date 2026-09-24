import { test } from '@playwright/test';

import { HomePage } from '../src/pages/HomePage';
import { ProductPage } from '../src/pages/ProductPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';

test.use({
  storageState: 'playwright/.auth/otp-user.json',
});

test.describe('Sharaf DG Product Purchase Flow', () => {
  test.setTimeout(120000);
  test('purchase Apple iPhone 14 Pro', async ({ page }) => {
    console.log('\n==============================================');
    console.log('PRODUCT PURCHASE FLOW');
    console.log('==============================================');

    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Open Sharaf DG home page', async () => {
      await homePage.goto();
      await homePage.expectLoggedIn();
    });

    await test.step('Open iPhone 14 Pro product page', async () => {
      await productPage.openProduct();
      await productPage.expectProductPageVisible();
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart();
    });

    await test.step('Open cart', async () => {
      await productPage.openCart();

      await cartPage.expectCartPageVisible();
      await cartPage.expectProductInCart();
    });

    await test.step('Proceed to checkout', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.expectCheckoutPageVisible();
    });

    await test.step('Select shipping address', async () => {
      await checkoutPage.selectHomeDelivery();

      await checkoutPage.enterNewShippingAddress();
    });

    

    await test.step('Select Checkout.com payment', async () => {
      await checkoutPage.selectCheckoutComPayment();
    });

   

    await test.step('Enter payment details', async () => {
  await checkoutPage.enterPaymentDetails(
    '456',
        'Test',
        '4276038578596818',
        '12/30',
        
  );
});

    await test.step('Place order', async () => {
      await checkoutPage.clickPlaceOrder();
    });

    await test.step('Verify order confirmation', async () => {
      await checkoutPage.expectOrderConfirmation();
    });
  });
});