import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  private readonly checkoutContainer: Locator;

  private readonly homeDelivery: Locator;
  private readonly storePickup: Locator;

  private readonly savedAddresses: Locator;
  private readonly defaultAddress: Locator;
  private readonly addNewAddress: Locator;

  private readonly mapSearchInput: Locator;
  private readonly shippingAddressInput: Locator;
  private readonly checkoutPaymentMethod: Locator;
private readonly savedCard: Locator;
private readonly savedCardCvv: Locator;
private readonly newCardOption: Locator;

  constructor(page: Page) {
    this.page = page;

    this.checkoutContainer = page.locator(
      '.checkout-container'
    );

    this.homeDelivery = page.locator(
      '#shipping_method_0_flat_rate1'
    );

    this.storePickup = page.locator(
      '#shipping_method_0_local_pickup_plus'
    );

    this.savedAddresses = page.locator(
      'input.shipping_address_radio[name="selected_address"]'
    );

    this.defaultAddress = page.locator(
      'input.shipping_address_radio[name="selected_address"][data-user_default="1"]'
    );

    this.addNewAddress = page
      .locator('.modal_sdg_address')
      .filter({
        hasText: 'Add New Address',
      })
      .first();

    this.mapSearchInput = page.locator(
      '#sdg-map-search'
    );

    this.shippingAddressInput = page.locator(
      '#shipping_address_1'
    );

    this.checkoutPaymentMethod = page.locator(
  '#payment_method_sdg_checkout'
);

this.savedCard = page.locator(
  '//input[@name="card_to_use" and @value!="new_card"]'
);

this.savedCardCvv = page.locator(
  'input.card_cvv_input'
);

this.newCardOption = page.locator(
  '#new_card'
);
  }

  async expectCheckoutPageVisible(): Promise<void> {
    await this.page.bringToFront();

    await expect(this.page).toHaveURL(
      /\/checkout/i,
      {
        timeout: 20000,
      }
    );

    await expect(this.checkoutContainer).toBeVisible({
      timeout: 20000,
    });
  }

async hasSavedAddress(): Promise<boolean> {
  await this.page.bringToFront();

  const addresses = this.page.locator(
    'input.shipping_address_radio[name="selected_address"]:visible'
  );

  const count = await addresses.count();

  console.log(
    `Visible saved shipping addresses found: ${count}`
  );

  return count > 0;
}

async selectSavedAddress(): Promise<void> {
  await this.page.bringToFront();

  const addresses = this.page.locator(
    'input.shipping_address_radio[name="selected_address"]:visible'
  );

  const addressCount = await addresses.count();

  if (addressCount === 0) {
    throw new Error(
      'No visible saved shipping address was found.'
    );
  }

  console.log(
    `Visible saved shipping addresses found: ${addressCount}`
  );

  const defaultAddress = this.page.locator(
    'input.shipping_address_radio[name="selected_address"][data-user_default="1"]:visible'
  );

  if (await defaultAddress.count() > 0) {
    console.log(
      'Selecting default saved shipping address.'
    );

    await defaultAddress.first().check({
      force: true,
    });

    await expect(
      defaultAddress.first()
    ).toBeChecked();

    return;
  }

  console.log(
    'No default address found. Selecting first saved address.'
  );

  await addresses.first().check({
    force: true,
  });

  await expect(
    addresses.first()
  ).toBeChecked();
}

async openAddNewAddress(): Promise<void> {
  await this.page.bringToFront();

  const shippingAddressSection = this.page.locator(
    '.shipping_address'
  ).first();

  await expect(shippingAddressSection).toBeVisible({
    timeout: 15000,
  });

  const addNewAddress = shippingAddressSection.getByText(
    'Add New Address',
    {
      exact: true,
    }
  ).first();

  await expect(addNewAddress).toBeVisible({
    timeout: 15000,
  });

  console.log(
    'Opening Add New Address...'
  );

  await addNewAddress.click();

  await expect(this.mapSearchInput).toBeVisible({
    timeout: 10000,
  });
}

async selectSavedCardAndEnterCvv(
  cvv: string
): Promise<boolean> {
  await this.page.bringToFront();

  const savedCard = this.page.locator(
    'input[type="radio"][name*="card"], ' +
    'input[type="radio"][name*="payment_method"]'
  ).filter({
    visible: true,
  }).first();

  if (await savedCard.count() === 0) {
    console.log('No saved card radio found.');
    return false;
  }

  console.log('Selecting saved card...');

  await savedCard.check({
    force: true,
  });

  await expect(savedCard).toBeChecked();

  const cvvInput = this.page.locator(
    'input.card_cvv_input:visible'
  ).first();

  if (await cvvInput.count() === 0) {
    throw new Error(
      'Saved card was found, but CVV input was not found.'
    );
  }

  await expect(cvvInput).toBeVisible({
    timeout: 10000,
  });

  console.log('Entering saved card CVV...');

  await cvvInput.fill(cvv);

  return true;
}

async selectNewCard(): Promise<void> {
  await this.page.bringToFront();

  const cardOption = this.page.locator(
    'input[type="radio"][name*="card"], ' +
    'input[type="radio"][name*="payment_method"]'
  ).filter({
    visible: true,
  }).last();

  if (await cardOption.count() > 0) {
    console.log('Selecting new card payment option...');

    await cardOption.check({
      force: true,
    });
  }

  await expect(
    this.page.locator(
      'iframe[data-testid="cardholder-name"]'
    )
  ).toBeVisible({
    timeout: 15000,
  });
}


async selectHomeDelivery(): Promise<void> {
  await this.page.bringToFront();

  const homeDelivery = this.page
    .locator('#shipping_method li')
    .filter({
      hasText: 'Home Delivery',
    })
    .first()
    .locator('input[type="radio"][name="shipping_method[0]"]');

  await expect(homeDelivery).toBeVisible({
    timeout: 20000,
  });

  if (!(await homeDelivery.isChecked())) {
    console.log('Selecting Home Delivery...');

    await homeDelivery.check({
      force: true,
    });
  } else {
    console.log('Home Delivery is already selected.');
  }

  await expect(homeDelivery).toBeChecked();

  // Allow checkout to render/update the address section.
  await this.page.waitForTimeout(1000);
}

async enterBurjKhalifaAddress2(): Promise<void> {
  await this.page.bringToFront();

  const address =
    'Burj Khalifa - 1 Sheikh Mohammed bin Rashid Blvd - Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates';

  const mapSearchInput = this.page.locator(
    '#sdg-map-search:visible'
  );

  const autocompleteContainer = this.page.locator(
    '#address_map-search .address-autocomplete-container'
  );

  const shippingAddressInput = this.page.locator(
    '#shipping_address_1:visible'
  );

  await expect(mapSearchInput).toBeVisible({
    timeout: 15000,
  });

  console.log('Entering address in map search...');

  await mapSearchInput.fill(address);

  /*
   * Sharaf DG uses a custom autocomplete container.
   * Wait for it to become visible after the address is typed.
   */
  await expect(autocompleteContainer).toBeVisible({
    timeout: 15000,
  });

  /*
   * The suggestions are dynamically rendered inside
   * .address-autocomplete-container.
   *
   * Select the first suggestion.
   */
  const firstSuggestion = autocompleteContainer
    .locator('> *')
    .first();

  await expect(firstSuggestion).toBeVisible({
    timeout: 10000,
  });

  console.log('Selecting first address suggestion...');

  await firstSuggestion.click();

  await this.page.waitForTimeout(1000);

  /*
   * Enter the same address into the actual shipping
   * address field.
   */
  await expect(shippingAddressInput).toBeVisible({
    timeout: 15000,
  });

  console.log('Entering address in shipping address field...');

  await shippingAddressInput.fill(address);

  await expect(shippingAddressInput).toHaveValue(
    address
  );

  console.log('Shipping address entered successfully.');
}


async enterNewShippingAddress(): Promise<void> {
  await this.page.bringToFront();

  const savedAddresses = this.page.locator(
    'input.shipping_address_radio[name="selected_address"]'
  );

  const savedAddressCount = await savedAddresses.count();

  console.log(
    `Saved shipping addresses found: ${savedAddressCount}`
  );

  if (savedAddressCount > 0) {
    console.log(
      'Shipping address already exists. Skipping address entry.'
    );

    const selectedAddress = savedAddresses
      .filter({
        has: this.page.locator(':checked'),
      })
      .first();

    if (
      await selectedAddress.count()
    ) {
      console.log(
        'Existing shipping address is already selected.'
      );
    } else {
      console.log(
        'Selecting the first available shipping address.'
      );

      await savedAddresses
        .first()
        .check({
          force: true,
        });

      await expect(
        savedAddresses.first()
      ).toBeChecked();
    }

    return;
  }

  console.log(
    'No saved shipping address found. Adding new address...'
  );

  await this.openNewAddressForm();

  await this.enterBurjKhalifaAddress();
}




async selectCheckoutComPayment(): Promise<void> {
  await this.page.bringToFront();

  const paymentMethod = this.page.locator(
    '#payment_method_sdg_checkout'
  );

  await expect(paymentMethod).toBeVisible({
    timeout: 15000,
  });

  if (!(await paymentMethod.isChecked())) {
    console.log('Selecting Checkout.com payment...');

    await paymentMethod.check({
      force: true,
    });
  }

  await expect(paymentMethod).toBeChecked();

  console.log('Checkout.com payment selected.');

  // Give Checkout.com time to render its web components.
  await this.page.waitForTimeout(1000);
}

async enterCheckoutComCard(
  cardholderName: string,
  cardNumber: string,
  expiryDate: string,
  cvv: string
): Promise<void> {
  await this.page.bringToFront();

  console.log('Entering Checkout.com card details...');

  const cardholderFrame = this.page.frameLocator(
    'iframe[data-testid="cardholder-name"]'
  );

  const cardNumberFrame = this.page.frameLocator(
    'iframe[data-testid="card-number"]'
  );

  const expiryFrame = this.page.frameLocator(
    'iframe[data-testid="card-expiry-date"]'
  );

  const cvvFrame = this.page.frameLocator(
    'iframe[data-testid="card-cvv"]'
  );

  const cardholderInput = cardholderFrame.getByTestId(
    'cardholder-name'
  );

  const cardNumberInput = cardNumberFrame.getByTestId(
    'card-number'
  );

  const expiryInput = expiryFrame.getByTestId(
    'card-expiry-date'
  );

  const cvvInput = cvvFrame.getByTestId(
    'card-cvv'
  );

  await expect(cardholderInput).toBeVisible({
    timeout: 15000,
  });

  await expect(cardNumberInput).toBeVisible({
    timeout: 15000,
  });

  await expect(expiryInput).toBeVisible({
    timeout: 15000,
  });

  await expect(cvvInput).toBeVisible({
    timeout: 15000,
  });

  await cardholderInput.fill(cardholderName);

  await cardNumberInput.fill(cardNumber);

  await expiryInput.fill(expiryDate);

  await cvvInput.fill(cvv);

  console.log('Checkout.com card details entered successfully.');
}


async clickPlaceOrder(): Promise<void> {
  await this.page.bringToFront();

  const placeOrderButton = this.page.locator(
    '#place_order'
  );

  await expect(placeOrderButton).toBeVisible({
    timeout: 15000,
  });

  await expect(placeOrderButton).toBeEnabled({
    timeout: 10000,
  });

  console.log('Clicking PLACE ORDER...');

  await placeOrderButton.click();

  console.log(
    'Waiting for Checkout.com verification URL...'
  );

  await expect
    .poll(
      () => this.page.url(),
      {
        timeout: 45000,
        intervals: [1000, 2000, 3000],
      }
    )
    .toMatch(
      /wc-api=sdg-checkout-verify/
    );

  const verificationUrl = this.page.url();

  console.log(
    'Checkout verification URL received.'
  );

  console.log(
    'Re-entering Checkout verification URL to work around existing checkout issue...'
  );

  await this.page.goto(
    verificationUrl,
    {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    }
  );

  console.log(
    'Checkout verification URL re-entered.'
  );

  console.log(
    'Order confirmation page should now be available.'
  );
}



async expectOrderConfirmation(): Promise<void> {
  await this.page.bringToFront();

  const confirmationMessage = this.page.locator(
    '.confirm-msg .woocommerce-thankyou-order-received'
  );

  const orderNumber = this.page.locator(
    '.confirm-msg .confirm-desc strong'
  );

  console.log(
    'Verifying order confirmation...'
  );

  await expect(confirmationMessage).toBeVisible({
    timeout: 30000,
  });

  await expect(confirmationMessage).toHaveText(
    'Thank you.',
    {
      timeout: 10000,
    }
  );

  await expect(orderNumber).toBeVisible({
    timeout: 10000,
  });

  const orderText = (
    await orderNumber.innerText()
  ).trim();

  expect(orderText).toMatch(
    /^Order number\s+STGAE\d+$/i
  );

  console.log(
    `Order confirmation verified: ${orderText}`
  );
}





private async openNewAddressForm(): Promise<void> {
  await this.page.bringToFront();

  const mapSearchInput = this.page.locator(
    '#sdg-map-search'
  );

  if (
    await mapSearchInput.isVisible().catch(() => false)
  ) {
    return;
  }

  const addNewAddressButton = this.page.getByText(
    'Add New Address',
    {
      exact: true,
    }
  );

  await expect(addNewAddressButton).toBeVisible({
    timeout: 15000,
  });

  console.log('Opening Add New Address...');

  await addNewAddressButton.click();

  await expect(mapSearchInput).toBeVisible({
    timeout: 15000,
  });
}

private async enterBurjKhalifaAddress(): Promise<void> {
  await this.page.bringToFront();

  const address =
    'Burj Khalifa - 1 Sheikh Mohammed bin Rashid Blvd - Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates';

  const mapSearchInput = this.page.locator(
    '#sdg-map-search'
  );

  const autocompleteContainer = this.page.locator(
    '#address_map-search .address-autocomplete-container'
  );

  const shippingAddressInput = this.page.locator(
    '#shipping_address_1'
  );

  await expect(mapSearchInput).toBeVisible({
    timeout: 15000,
  });

  console.log(
    'Entering address in map search...'
  );

  await mapSearchInput.fill(address);

  await expect(autocompleteContainer).toBeVisible({
    timeout: 15000,
  });

  const firstSuggestion =
    autocompleteContainer
      .locator('> *')
      .first();

  await expect(firstSuggestion).toBeVisible({
    timeout: 10000,
  });

  console.log(
    'Selecting first address suggestion...'
  );

  await firstSuggestion.click();

  await this.page.waitForTimeout(1000);

  await expect(shippingAddressInput).toBeVisible({
    timeout: 15000,
  });

  await shippingAddressInput.fill(address);

  await expect(
    shippingAddressInput
  ).toHaveValue(address);

  console.log(
    'Shipping address entered successfully.'
  );
}

async enterPaymentDetails(
  cvv: string,
  cardholderName: string,
  cardNumber: string,
  expiryDate: string,
): Promise<void> {
  await this.page.bringToFront();

  await expect(this.checkoutPaymentMethod).toBeVisible({
    timeout: 15000,
  });

  await this.checkoutPaymentMethod.check();

  const savedCards = this.page.locator(
    'input.card_to_use:not(#new_card)'
  );

  const savedCardCount = await savedCards.count();

  console.log(
    `Saved Checkout.com cards found: ${savedCardCount}`
  );

 if (savedCardCount > 0) {
  const selectedSavedCard = this.page.locator(
    '.saved_card.card-box:has(input.card_to_use:checked)'
  );

  if (await selectedSavedCard.count() === 0) {
    console.log(
      'Saved card exists. Selecting the first saved card...'
    );

    await savedCards.first().check();
  }

  const selectedCard = this.page.locator(
    '.saved_card.card-box:has(input.card_to_use:checked)'
  );

  await expect(selectedCard).toBeVisible({
    timeout: 10000,
  });

  const savedCardCvv = selectedCard.locator(
    'input.card_cvv_input'
  );

  await expect(savedCardCvv).toBeVisible({
    timeout: 10000,
  });

  await expect(savedCardCvv).toBeEnabled({
    timeout: 10000,
  });

  console.log(
    'Entering CVV for selected saved card...'
  );

  await savedCardCvv.click();

  await savedCardCvv.fill('');

  await savedCardCvv.fill(cvv);

  await expect(savedCardCvv).toHaveValue(cvv, {
    timeout: 5000,
  });

  console.log(
    'CVV entered and verified successfully.'
  );

  await savedCardCvv.press('Tab');

  return;
}

  console.log(
    'No saved card found. Selecting new credit card...'
  );

  await expect(this.newCardOption).toBeVisible({
    timeout: 10000,
  });

  await this.newCardOption.check();

  await this.enterCheckoutComCard(
    cardholderName,
    cardNumber,
    expiryDate,
    cvv
  );
}
}