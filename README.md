# yuno-sdk-web

## Table of Contents

- [yuno-sdk-web](#yuno-sdk-web)
  - [Table of Contents](#table-of-contents)
  - [Browser Requirements](#browser-requirements)
  - [Use Checkout Full](#use-full-checkout)
  - [Use Checkout Seamless Lite](#use-seamless-checkout-lite)
  - [Use Checkout Lite](#use-checkout-lite)
  - [Hide Checkout Pay Button](#hide-checkout-pay-button)
  - [Use Checkout Secure Fields](#use-checkout-secure-fields)
  - [Use Status](#use-status)
  - [Use Status Lite](#use-status-lite)
  - [Use Enrollment Lite](#use-enrollment-lite)
  - [Use Enrollment With Secure Fields](#use-enrollment-with-secure-fields)
  - [Start Demo App](#start-demo-app)
  - [CSS Styles](#css-styles)
  - [Typescript](#typescript)

## Browser Requirements

* We don't support IE 


## Use Full Checkout

To use full checkout you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Then start checkout with configuration

```javascript
yuno.startCheckout({
  /**
   * Refers to the current payment's checkout session.
   * @example `438413b7-4921-41e4-b8f3-28a5a0141638`
   * @type {String}
   */
  checkoutSession,
  /**
   * Element where the SDK will be mount on 
   */ 
  elementSelector: '#root', 
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: country,
  /**
  * Language can be one of es, en, pt
  * Default is browser language
  */
  language: 'es',
  /**
   * Hide or show the Yuno loading/spinner page
   * @default true
   * @optional
   */
  showLoading: true,
  /**
   * Enable the issuers form (bank list)
   * @default true
   * @optional
   */
  issuersFormEnable: true,
  /**
   * Hide or show the Yuno Payment Status page
   * @default true
   * @optional
   */
  showPaymentStatus: true,
  /**
   * Hide or show the customer or card form pay button
   * @default true
   * @optional
   */
  showPayButton: true,
  /**
   * Required if you'd like to be informed if there is a server call
   * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
   * @optional
   */
  onLoading: (args) => {
    console.log(args);
  }
  /**
   * Where and how the forms will be shown
   * @default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * @default 'modal'
     * @optional
     */
    type: 'modal',
    /**
     * Element where the form will be rendered.
     * Can be a string (deprecated) or an object with the following structure:
     * 
     * {
     *   apmForm: "#form-element",
     *   actionForm: "#action-form-element"
     * }
     * 
     * Only needed if type is `element`.
     * 
     * @optional
     */
    elementSelector: {
      apmForm: "#form-element",
      actionForm: "#action-form-element"
    } // or use a string (deprecated): '#form-element',
  },
  /**
   *  Card API
   *  @optional
   */
  card: {
    /**
     * Mode render card can be step or extends
     * @default 'extends'
     * @optional
     */
    type: "extends",
    /**
     * You can edit card form styles
     * Only you should write css, then it will be injected into the iframe
     * Example 
     * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
     *  .Yuno-front-side-card__name-label { 
     *    color: red !important;
     *    font-family: 'Luckiest Guy' !important;
     *   }`
     * @optional
     */
    styles: '',
    /** 
     * Show checkbox for save/enroll card 
     * @default false
     * @optional
     */
    cardSaveEnable: false,
    /**
     * Custom texts in Card forms buttons
     * @example
     *  texts: {
     *    cardForm?: {
     *      enrollmentSubmitButton?: string;
     *       paymentSubmitButton?: string;
     *     }
     *     cardStepper?: {
     *       numberCardStep?: {
     *         nextButton?: string;
     *       },
     *       cardHolderNameStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       expirationDateStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       cvvStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       }
     *     }
     *  }
     * @optional
     */
    texts: {}
  },
  /**
   * Custom texts in payment forms buttons 
   * @example
   *  texts: {
   *    customerForm?: {
   *       submitButton?: string;
   *     }
   *     paymentOtp?: {
   *       sendOtpButton?: string;
   *     }
   *   }
   * @optional
   */
  texts: {},
  /**
   * Callback, is called when the One Time Token is created,
   * Merchant should create payment back to back
   * @param { oneTimeToken: string, tokenWithInformation: object } data 
   */
  async yunoCreatePayment(oneTimeToken, tokenWithInformation) {
    /**
     * Merchant's function to call its backend to create 
     * the payment into Yuno.
     * {@link https://docs.y.uno/reference/create-payment}
     */
    await createPayment({ oneTimeToken, checkoutSession })
    /**
     * Call only if the SDK needs to continue the payment flow
     * @param {{ showPaymentStatus: boolean }}
     */
    yuno.continuePayment({ showPaymentStatus: true })
  },
  /**
   * Callback is called when user selects a payment method
   * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY', name: string} } data 
   * @optional
   */
  yunoPaymentMethodSelected(data) {
    console.log('onPaymentMethodSelected', data)
  },
  /**
   * After the payment is done, this function will be called with the payment status 
   * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   * @optional
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)

    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
  /**
   * If this is called the SDK should be mounted again
   * @param { error: 'CANCELED_BY_USER' | string, data?: { cause: USER_CANCEL_ON_PROVIDER | string, provider: PAYPAL | string } }
   * @optional
   */
  yunoError: (error, data) => {
    console.log('There was an error', error)
    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
})
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
/**
 * Mount checkout in browser DOM
 */
await yuno.mountCheckout()
```

If you need to select a payment method by default, mount it using

```javascript
/**
 * Mount checkout in browser DOM with a payment method selected by default
 * @optional
 */
await yuno.mountCheckout({
  /**
   * Optional, only needed if you would like this method type selected by default
   * Can be one of 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO
   */
  paymentMethodType: PAYMENT_METHOD_TYPE,
  /**
   * Optional
   * Vaulted token related to payment method type
   */
  vaultedToken: VAULTED_TOKEN,
})
```

Remember you need to call 
```javascript
yuno.startPayment()
```
to start the payment flow after the user has selected a payment method.  

Example:
```javascript
// Start payment when user clicks on merchant payment button
const PayButton = document.querySelector('#button-pay')

PayButton.addEventListener('click', () => {
  yuno.startPayment()
})
```

[Checkout demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/checkout.html)  
[Checkout demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/checkout.js)

## Use Seamless Checkout Lite

To use checkout seamless you should include our **SDK** file in your page before close your `</body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
yuno.startCheckout({
  /**
   * Refers to the current payment's checkout session.
   * @example `438413b7-4921-41e4-b8f3-28a5a0141638`
   * @type {String}
   */
  checkoutSession,
  /**
   * Element where the SDK will be mount on 
   */ 
  elementSelector: '#root', 
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: country,
  /**
  * Language can be one of es, en, pt
  * Default is browser language
  */
  language: 'es',
  /**
   * Hide or show the Yuno loading/spinner page
   * @default true
   * @optional
   */
  showLoading: true,
  /**
   * Enable the issuers form (bank list)
   * @default true
   * @optional
   */
  issuersFormEnable: true,
  /**
   * Hide or show the Yuno Payment Status page
   * @default true
   * @optional
   */
  showPaymentStatus: true,
  /**
   * Hide or show the customer or card form pay button
   * @default true
   * @optional
   */
  showPayButton: true,
  /**
   * Required if you'd like to be informed if there is a server call
   * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
   * @optional
   */
  onLoading: (args) => {
    console.log(args);
  }
  /**
   * Where and how the forms will be shown
   * @default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * @default 'modal'
     * @optional
     */
    type: 'modal',
    /**
     * Element where the form will be rendered.
     * Can be a string (deprecated) or an object with the following structure:
     * 
     * {
     *   apmForm: "#form-element",
     *   actionForm: "#action-form-element"
     * }
     * 
     * Only needed if type is `element`.
     * 
     * @optional
     */
    elementSelector: {
      apmForm: "#form-element",
      actionForm: "#action-form-element"
    } // or use a string (deprecated): '#form-element',
  }
  /**
   * Card API
   * @optional
   */
  card: {
    /**
     * Card render mode can be either `step` or `extends`
     * @default 'extends' 
     * @optional
     */
    type: "extends",
    /**
     * You can edit card form styles
     * Only you should write css, then it will be injected into the iframe
     * Example 
     * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
     *  .Yuno-front-side-card__name-label { 
     *    color: red !important;
     *    font-family: 'Luckiest Guy' !important;
     *   }`
     * @optional
     */
    styles: '',
    /** 
     * Show checkbox for save/enroll card 
     * @default false
     * @optional
     */
    cardSaveEnable: false,
    /**
     * Custom texts in Card forms buttons
     * @example
     *  texts: {
     *    cardForm?: {
     *      enrollmentSubmitButton?: string;
     *       paymentSubmitButton?: string;
     *     }
     *     cardStepper?: {
     *       numberCardStep?: {
     *         nextButton?: string;
     *       },
     *       cardHolderNameStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       expirationDateStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       cvvStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       }
     *     }
     *  }
     * @optional
     */
    texts: {}
  },
  /**
   * Custom texts in payment forms buttons 
   * @exmaple
   *  texts: {
   *    customerForm?: {
   *       submitButton?: string;
   *     }
   *     paymentOtp?: {
   *       sendOtpButton?: string;
   *     }
   *   }
   * @optional
   */
  texts: {},
  /**
   * Empty function.  Won't be called, but should be implemented
   */
  async yunoCreatePayment() {},
  /**
   * Callback is called when user selects a payment method
   * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY', name: string} } data 
   * @optional
   */
  yunoPaymentMethodSelected(data) {
    console.log('onPaymentMethodSelected', data)
  },
  /**
   * After the payment is done, this function will be called with the payment status 
   * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   * @optional
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)
    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
  /**
   * If this is called the SDK should be mounted again
   * @param { error: 'CANCELED_BY_USER' | string, data?: { cause: USER_CANCEL_ON_PROVIDER | string, provider: PAYPAL | string } }
   * @optional
   */
  yunoError: (error, data) => {
    console.log('There was an error', error)
    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
})
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
await yuno.mountSeamlessCheckoutLite({
  /**
   * can be one of 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO | CARD
   */
  paymentMethodType: PAYMENT_METHOD_TYPE,
  /**
   * Vaulted token related to payment method type.
   * Only if you already have it
   * @optional 
   */
  vaultedToken: VAULTED_TOKEN,
})
```

After it is mounted, it will start the desired flow

[Checkout seamless demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/checkout-seamless-lite.html)  
[Checkout seamless demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/checkout-seamless-lite.js)


## Use Checkout Lite

To use checkout lite you should include our **SDK** file in your page before close your `</body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
yuno.startCheckout({
  /**
   * Refers to the current payment's checkout session.
   * @example `438413b7-4921-41e4-b8f3-28a5a0141638`
   * @type {String}
   */
  checkoutSession,
  /**
   * Element where the SDK will be mount on 
   */ 
  elementSelector: '#root', 
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: country,
  /**
  * Language can be one of es, en, pt
  * Default is browser language
  */
  language: 'es',
  /**
   * Hide or show the Yuno loading/spinner page
   * @default true
   * @optional
   */
  showLoading: true,
  /**
   * Enable the issuers form (bank list)
   * @default true
   * @optional
   */
  issuersFormEnable: true,
  /**
   * Hide or show the Yuno Payment Status page
   * @default true
   * @optional
   */
  showPaymentStatus: true,
  /**
   * Hide or show the customer or card form pay button
   * @default true
   * @optional
   */
  showPayButton: true,
  /**
   * Required if you'd like to be informed if there is a server call
   * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
   * @optional
   */
  onLoading: (args) => {
    console.log(args);
  }
  /**
   * Where and how the forms will be shown
   * @default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * @default 'modal'
     * @optional
     */
    type: 'modal',
    /**
     * Element where the form will be rendered.
     * Can be a string (deprecated) or an object with the following structure:
     * 
     * {
     *   apmForm: "#form-element",
     *   actionForm: "#action-form-element"
     * }
     * 
     * Only needed if type is `element`.
     * 
     * @optional
     */
    elementSelector: {
      apmForm: "#form-element",
      actionForm: "#action-form-element"
    } // or use a string (deprecated): '#form-element',
  }
  /**
   * Card API
   * @optional
   */
  card: {
    /**
     * Card render mode can be either `step` or `extends`
     * @default 'extends' 
     * @optional
     */
    type: "extends",
    /**
     * You can edit card form styles
     * Only you should write css, then it will be injected into the iframe
     * Example 
     * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
     *  .Yuno-front-side-card__name-label { 
     *    color: red !important;
     *    font-family: 'Luckiest Guy' !important;
     *   }`
     * @optional
     */
    styles: '',
    /** 
     * Show checkbox for save/enroll card 
     * @default false
     * @optional
     */
    cardSaveEnable: false,
    /**
     * Custom texts in Card forms buttons
     * @example
     *  texts: {
     *    cardForm?: {
     *      enrollmentSubmitButton?: string;
     *       paymentSubmitButton?: string;
     *     }
     *     cardStepper?: {
     *       numberCardStep?: {
     *         nextButton?: string;
     *       },
     *       cardHolderNameStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       expirationDateStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       cvvStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       }
     *     }
     *  }
     * @optional
     */
    texts: {}
  },
  /**
   * Custom texts in payment forms buttons 
   * @exmaple
   *  texts: {
   *    customerForm?: {
   *       submitButton?: string;
   *     }
   *     paymentOtp?: {
   *       sendOtpButton?: string;
   *     }
   *   }
   * @optional
   */
  texts: {},
  /**
   * Callback, is called when the One Time Token is created,
   * Merchant should create payment back to back
   * @param { oneTimeToken: string, tokenWithInformation: object } data 
   */
  async yunoCreatePayment(oneTimeToken, tokenWithInformation) {
    /**
     * Merchant's function to call its backend to create 
     * the payment into Yuno.
     * {@link https://docs.y.uno/reference/create-payment}
     */
    await createPayment({ oneTimeToken, checkoutSession })
    /**
     * Call only if the SDK needs to continue the payment flow
     * @param {{ showPaymentStatus: boolean }}
     */
    yuno.continuePayment({ showPaymentStatus: true })
  },
  /**
   * Callback is called when user selects a payment method
   * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY', name: string} } data 
   * @optional
   */
  yunoPaymentMethodSelected(data) {
    console.log('onPaymentMethodSelected', data)
  },
  /**
   * After the payment is done, this function will be called with the payment status 
   * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   * @optional
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)
    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
  /**
   * If this is called the SDK should be mounted again
   * @param { error: 'CANCELED_BY_USER' | string, data?: { cause: USER_CANCEL_ON_PROVIDER | string, provider: PAYPAL | string } }
   * @optional
   */
  yunoError: (error, data) => {
    console.log('There was an error', error)
    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
})
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
await yuno.mountCheckoutLite({
  /**
   * can be one of 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO | CARD
   */
  paymentMethodType: PAYMENT_METHOD_TYPE,
  /**
   * Vaulted token related to payment method type.
   * Only if you already have it
   * @optional 
   */
  vaultedToken: VAULTED_TOKEN,
})
```

After it is mounted, it will start the desired flow

[Checkout lite demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/checkout-lite.html)  
[Checkout lite demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/checkout-lite.js)

## Hide Checkout Pay Button

If you would like to hide the customer or card pay button, in the checkout configuration set the `showPayButton` to `false` then call the function `submitOneTimeTokenForm` as shown below

```javascript
yuno.startCheckout({
  /**
   * Hide or show the customer or card form pay button
   * @default true
   * @optional
   */
  showPayButton: false,
  /**
   * Set other configurations 
   */
})

/**
 * This function trigger the same functionality that is called when the customer clicks on the pay form button.  This doesn't work on the step Card form
 */
yuno.submitOneTimeTokenForm()
```

## Use Checkout Secure Fields

To use checkout secure fields you should include our **SDK** file in your page before close your `</body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
  const secureFields = yuno.secureFields({
    /**
     * This parameter determines the country for which the payment process is being configured.
     * The complete list of supported countries and their country code is available on the
     * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
     * @type {String}
     */
    countryCode,
    /**
     * Should be added here or in the token generation
     * @optional
     */
    checkoutSession,
    /**
     * disabled or enable the functionality of the installment
     * @default false
     */
    installmentEnable: false
  })
```

Configure and mount every secure field and mount them in `html` elements, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
  /**
   * interface SecureField {
   *  render(elementSelector: string): void
   * 
   *  clearValue(): void
   * 
   *  setError(errorMessage: string): void
   * 
   *  updateProps(args: Record<string, unknown>): void
   * 
   *  focus(): void
   * 
   *  validate(): void
   * 
   *  unmountSync(): Promise<void>
   * }
   */


  const secureNumber = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'pan',
    // All options are optional
    options: {
      placeholder: '0000 0000 0000 0000',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'Card Number',
      showError: true,
      errorMessage: 'Test message',
      /**
       * Change validation behavior, improving user experience
       * providing validation feedback after the field has lost focus
       * @type {?boolean}
       * @default false
       * @optional
       */
      validateOnBlur: false,
      /**
       * @param {{
       *    data: {
       *      installments?:  [
       *        { 
       *          installmentId: string, 
       *          installment: number, 
       *          amount: { 
       *            currency: string, 
       *            value: string, 
       *            total_value: string 
       *          }
       *        }
       *      ],
       *      cardIIN?: {
       *        id: string,
       *        iin: string,
       *        scheme: string,
       *        issuer_name: string
       *        issuer_code: string,
       *        brand: string,
       *        type: string,
       *        category: string,
       *        country_code: string,
       *        country_name: string,
       *        website: string,
       *        phone: {
       *          country_code: string | null,
       *          number: string | null
       *        },
       *        address: {
       *          address_line_1: string | null,
       *          address_line_2: string | null,
       *          city: string | null,
       *          country: string | null,
       *          state: string | null,
       *          zip_code: string | null
       *        }
       *      }
       *    },
       *    error: boolean
       *  }} event
       *
       * @example { event: {
       *  data : {
       *    installments: [{
       *      {
       *        "installmentId": "10cef26f-7d5e-4783-89ee-e00f7ed93b64",
       *        "installment": 1,
       *        "amount": {
       *            "currency": "COP",
       *            "value": "2200",
       *            "total_value": "2200"
       *        }
       *      },
       *      {
       *        "installmentId": "10cef26f-7d5e-4783-89ee-e00f7ed93b64",
       *        "installment": 12,
       *        "amount": {
       *            "currency": "COP",
       *            "value": "2200",
       *            "total_value": "2200"
       *        }
       *      }
       *    }]
       *  }
       * }}
       */
      onChange: (event) => {
        if (event.error) {
          console.log('error_pan')
        } else {
          console.log('not_error_pan')
        }

        if (event.data.installments) {
          console.log('installments', event.data.installments)
        }
      },
      /**
       * Triggered when blurring from input
       */
      onBlur() {
        console.log('blur_pan')
      },
      /**
       * Triggered when focussing on input
       */
      onFocus: () => {
        console.log('focus_pan')
      },
      // Trigger when input has finished rendering 
      onRenderedSecureField: ()=> {
        console.log('render completed')
      }
    },
  })

  // Render into desired element
  secureNumber.render('#pan')

  const secureExpiration = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'expiration',
    // All options are optional
    options: {
      placeholder: 'MM / YY',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'Card Expiration',
      showError: true,
      errorMessage: 'Test message',
      /**
       * Change validation behavior, improving user experience
       * providing validation feedback after the field has lost focus
       * @type {?boolean}
       * @default false
       * @optional
       */
      validateOnBlur: false,
      // Indicates if the fields has error
      onChange: ({ error }) => {
        if (error) {
          console.log('error_expiration')
        } else {
          console.log('not_error_expiration')
        }
      },
      /**
       * Triggered when blurring from input
       */
      onBlur() {
        console.log('blur_expiration')
      },
      /**
       * Triggered when focussing on input
       */
      onFocus: () => {
        console.log('focus_expiration')
      },
      // Trigger when input has finished rendering 
      onRenderedSecureField: ()=> {
        console.log('render completed')
      }
    },
  })

  // Render into desired element
  secureExpiration.render('#expiration')


  const secureCvv = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'cvv',
    // All options are optional
    options: {
      placeholder: 'CVV',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'CVV',
      showError: true,
      errorMessage: 'Test message',
      /**
       * Change validation behavior, improving user experience
       * providing validation feedback after the field has lost focus
       * @type {?boolean}
       * @default false
       * @optional
       */
      validateOnBlur: false,
      // Indicates if the fields has error
      onChange: ({ error }) => {
        if (error) {
          console.log('error_cvv')
        } else {
          console.log('not_error_cvv')
        }
      },
      /**
       * Triggered when blurring from input
       */
      onBlur() {
        console.log('blur_cvv')
      },
      /**
       * Triggered when focussing on input
       */
      onFocus: () => {
        console.log('focus_cvv')
      },
      // Trigger when input has finished rendering 
      onRenderedSecureField: ()=> {
        console.log('render completed')
      }
    },
  })

  // Render into desired element
  secureCvv.render('#cvv')
```

After they are mounted, the three secure fields will be shown

To start payment, create a One Time Token

```javascript
// Create One Time Token
// This will trigger an error if there are missing data
// You can catch it using a try/catch
const oneTimeToken = await secureFields.generateToken({
  // Required: You can create an input to get this formation
  cardHolderName: 'John Deer',
  // Optional: You can create an input to get this formation
  saveCard: true,
  /**
   * @optional
   */
  checkoutSession,
  /**
   * @optional
   * Send this value if you already have a registered or enrolled payment method.
   * Other fields like card and customer are optional unless your provider requires them.
   */
  vaultedToken: "aad8578e-ac2f-40a0-8065-25b5957f6555",
  // Check your card processor to know if you need to send 
  // customer information
  // full object here https://docs.y.uno/reference/the-customer-object
  customer: {
    document: {
      document_number: '1090209924',
      document_type: 'CC',
    },
  },
  // Optional: Send installment.  installmentId, installment from pan onChange event
  installment: {
    id: installmentId,
    value: installment
  }
})
```

If you need the full response you can use `secureFields.generateTokenWithInformation`

```javascript
/**
 *  Create One Time Token
 *  This will trigger an error if there are missing data
 *  You can catch it using a try/catch
 *  Returns an object with the full response
 *  {
 *   token: string;
 *   vaulted_token: string | null;
 *   vault_on_success: boolean;
 *   type: Payment.Type;
 *   card_data?: {
 *       holder_name: string;
 *       iin: string;
 *       lfd: string;
 *       number_length: number;
 *       security_code_length: number;
 *       brand: string;
 *       issuer_name: string;
 *       issuer_code: string | null;
 *       category: string | null;
 *       type: string;
 *    };
 *    customer: Customer;
 *  }
 */ 
const oneTimeTokenWithInformation = await secureFields.generateTokenWithInformation({
  // Required: You can create an input to get this formation
  cardHolderName: 'John Deer',
  // Optional: You can create an input to get this formation
  saveCard: true,
  /**
   * @optional
   * Send this value if you already have a registered or enrolled payment method.
   * Other fields like card and customer are optional unless your provider requires them.
   */
  vaultedToken: "aad8578e-ac2f-40a0-8065-25b5957f6555",
  // Check your card processor to know if you need to send 
  // customer information
  // full object here https://docs.y.uno/reference/the-customer-object
  customer: {
    document: {
      document_number: '1090209924',
      document_type: 'CC',
    },
  },
})
```

Finally create a payment

```javascript
/**
 * Create your payment, you should implement this function
 * {@link https://docs.y.uno/reference/create-payment}
 */
await createPayment({ oneTimeToken, checkoutSession })

// Check payment status
yuno.mountStatusPayment({
  checkoutSession: checkoutSession,
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: 'CO',
  /**
   * Language can be one of es, en, pt
   */
  language: 'en',
  /**
   * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)
  },
})
```

[Checkout secure fields demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/checkout-secure-fields.html)  
[Checkout secure fields demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/checkout-secure-fields.js)

## Use Status

To use status you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
yuno.mountStatusPayment({
  checkoutSession: '438413b7-4921-41e4-b8f3-28a5a0141638',
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: 'CO',
  /**
  * Language can be one of es, en, pt
  */
  language: 'es',
  /**
   * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)
  }
})
```

[Status demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/status.html)  
[Status demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/status.js)

## Use Status Lite

To use status lite you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Finally call the **SDK** `yunoPaymentResult` method.

```javascript
/**
 * Call method that returns status, this won't render anything
 * 
 * @return {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'}
 */
const status = await yuno.yunoPaymentResult(checkoutSession)
```
[Status Lite demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/status-lite.html)  
[Status Lite demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/status-lite.js)

## Use Enrollment Lite

To use enrollment lite you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Finally call the **SDK** `mountEnrollmentLite` method.

```javascript
yuno.mountEnrollmentLite({
  customerSession,
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: country,
  /**
  * Language can be one of es, en, pt
  * Default is browser language
  */
  language: 'es',
  /**
   * Hide or show the Yuno loading/spinner page
   * Default is true
   * @optional
   */
  showLoading: true,
  /**
   * Required if you'd like to be informed if there is a server call
   * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
   * @optional
   */
  onLoading: (args) => {
    console.log(args);
  }
  /**
   * Where and how the forms will be shown
   * Default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * @default 'modal'
     * @optional
     */
    type: 'modal',
    /**
     * Element where the form will be rendered.
     * Can be a string (deprecated) or an object with the following structure:
     * 
     * {
     *   apmForm: "#form-element",
     *   actionForm: "#action-form-element"
     * }
     * 
     * Only needed if type is `element`.
     * 
     * @optional
     */
    elementSelector: {
      apmForm: "#form-element",
      actionForm: "#action-form-element"
    } // or use a string (deprecated): '#form-element',
  }
  /**
   *  API card
   *  @optional
   */
  card: {
    /**
     * Mode render card can be step or extends
     * @default 'extends'
     * @optional
     */
    type: "extends",
    /**
     * You can edit card form styles
     * Only you should write css, then it will be injected into the iframe
     * Example 
     * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
     *  .Yuno-front-side-card__name-label { 
     *    color: red !important;
     *    font-family: 'Luckiest Guy' !important;
     *   }`
     */
    styles: '',
    /** 
     * Show checkbox for save/enroll card 
     * Default is false
     */
    cardSaveEnable: false,
    /**
     * Custom texts in Card forms buttons
     * Example:
     * 
     *  texts: {
     *    cardForm?: {
     *      enrollmentSubmitButton?: string;
     *       paymentSubmitButton?: string;
     *     }
     *     cardStepper?: {
     *       numberCardStep?: {
     *         nextButton?: string;
     *       },
     *       cardHolderNameStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       expirationDateStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       },
     *       cvvStep?: {
     *         prevButton?: string;
     *         nextButton?: string;
     *       }
     *     }
     *  }
     */
    texts: {},
    /**
     * Hide or show the document fields into card form
     * Default is true
     * @optional
     */
    documentEnable: true,
  },
  /**
   * Call back is called with the following object
   * @param {{ 
   *  status: 'CREATED'
   *    | 'EXPIRED',
   *    | 'REJECTED',
   *    | 'READY_TO_ENROLL',
   *    | 'ENROLL_IN_PROCESS',
   *    | 'UNENROLL_IN_PROCESS',
   *    | 'ENROLLED',
   *    | 'DECLINED',
   *    | 'CANCELED',
   *    | 'ERROR',
   *    | 'UNENROLLED', 
   *  vaultedToken: string,
   * }}
   */
  yunoEnrollmentStatus: ({ status, vaultedToken}) => {
    console.log('status', { status, vaultedToken})
  },
  /**
   * If this is called the SDK should be mounted again
   * @param { error: 'CANCELED_BY_USER' | string, data?: { cause: USER_CANCEL_ON_PROVIDER | string, provider: PAYPAL | string } }
   * @optional
   */
  yunoError: (error, data) => {
    console.log('There was an error', error)
    /**
     * call if you want to hide the loader 
     */
    yuno.hideLoader()
  },
});
```
[Enrollment Lite demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/enrollment-lite.html)  
[Enrollment Lite demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/enrollment-lite.js)


## Use Enrollment With Secure Fields

To use enrollment with secure fields you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.y.uno/v1/static/js/main.min.js"></script>
```

Get a `Yuno` instance class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = Yuno.initialize(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
  const secureFields = yuno.secureFields({
    /**
     * This parameter determines the country for which the payment process is being configured.
     * The complete list of supported countries and their country code is available on the
     * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
     * @type {String}
     */
    countryCode,
    /**
     * Should be added her or in the token generation
     * @optional
     */
    customerSession,
  })
```

Configure and mount every secure field and mount them in `html` elements, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
   /**
   * interface SecureField {
   *  render(elementSelector: string): void
   * 
   *  clearValue(): void
   * 
   *  setError(errorMessage: string): void
   * 
   *  updateProps(args: Record<string, unknown>): void
   * 
   *  focus(): void
   * 
   *  validate(): void
   * 
   *  unmountSync(): Promise<void>
   * }
   */

  const secureNumber = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'pan',
    // All options are optional
    options: {
      placeholder: '0000 0000 0000 0000',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'Card Number',
      showError: true,
      errorMessage: 'Test message',
      // Indicates if the fields has error
      onChange: ({ error }) => {
        if (error) {
          console.log('error_pan')
        } else {
          console.log('not_error_pan')
        }
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_pan')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_pan')
      },
      // Trigger when input has finished rendering 
      onRenderedSecureField: ()=> {
        console.log('render completed')
      }
    },
  })

  // Render into desired element
  secureNumber.render('#pan')

  const secureExpiration = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'expiration',
    // All options are optional
    options: {
      placeholder: 'MM / YY',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'Card Expiration',
      showError: true,
      errorMessage: 'Test message',
      // Indicates if the fields has error
      onChange: ({ error }) => {
        if (error) {
          console.log('error_expiration')
        } else {
          console.log('not_error_expiration')
        }
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_expiration')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_expiration')
      },
      // Trigger when input has finished rendering 
      onRenderedSecureField: ()=> {
        console.log('render completed')
      }
    },
  })

  // Render into desired element
  secureExpiration.render('#expiration')


  const secureCvv = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'cvv',
    // All options are optional
    options: {
      placeholder: 'CVV',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'CVV',
      showError: true,
      errorMessage: 'Test message',
      // Indicates if the fields has error
      onChange: ({ error }) => {
        if (error) {
          console.log('error_cvv')
        } else {
          console.log('not_error_cvv')
        }
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_cvv')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_cvv')
      },
      // Trigger when input has finished rendering 
      onRenderedSecureField: ()=> {
        console.log('render completed')
      }
    },
  })

  // Render into desired element
  secureCvv.render('#cvv')
```

After they are mounted, the three secure fields will be shown

To enroll, create a Vaulted Token

```javascript
// Create Vaulted Token
// This will trigger an error if there are missing data
// You can catch it using a try/catch
const vaultedToken = await secureFields.generateVaultedToken({
  // Required: You can create an input to get this formation
  cardHolderName: 'John Deer',
  /**
   * @optional
   */
  customerSession,
  // Check your card processor to know if you need to send 
  // customer information
  // full object here https://docs.y.uno/reference/the-customer-object
  customer: {
    document: {
      document_number: '1090209924',
      document_type: 'CC',
    },
  },
})
```

If you need the full response you can use `secureFields.generateVaultedTokenWithInformation`

```javascript
/**
 *  Create One Time Token
 *  This will trigger an error if there are missing data
 *  You can catch it using a try/catch
 *  Returns an object with the full response
 *  {
 *   code: string;
 *   idempotency_key: string;
 *   organization_code: string;
 *   account_code: string;
 *   customer_session: string;
 *   name: string;
 *   description: string;
 *   status: Enrollment.Status;
 *   type: Payment.Type;
 *   category: Payment.Category;
 *   provider: {
 *       type: string;
 *       action: string;
 *       token: string;
 *       enrollment_id: string | null;
 *       provider_status: string | null;
 *       redirect: string | null;
 *       raw_response: unknown;
 *   };
 *   created_at: Date;
 *   updated_at: Date;
 *  }
 */ 
const vaultedTokenWithInformation = await secureFields.generateVaultedTokenWithInformation({
  // Required: You can create an input to get this formation
  cardHolderName: 'John Deer',
  // Check your card processor to know if you need to send 
  // customer information
  // full object here https://docs.y.uno/reference/the-customer-object
  customer: {
    document: {
      document_number: '1090209924',
      document_type: 'CC',
    },
  },
})
```

## Start Demo App

```sh
> git clone https://github.com/yuno-payments/yuno-sdk-web.git
> cd yuno-sdk-web
> npm install
> npm start
```

You need to create a `.env` file in the root folder with your test keys and server port

```sh
ACCOUNT_CODE=abc
PUBLIC_API_KEY=abc
PRIVATE_SECRET_KEY=abc
```

[ACCOUNT_CODE](https://dashboard.y.uno/developers)  
[PUBLIC_API_KEY](https://docs.y.uno/reference/authentication)  
[PRIVATE_SECRET_KEY](https://docs.y.uno/reference/authentication)  


Then go to [http://localhost:8080](http://localhost:8080)  

To change the country you can add a query parameter named `country` with one of `CO, BR, CL, PE, EC, UR, MX`  
[http://localhost:8080?country=CO](http://localhost:8080?country=CO)

## CSS Styles

All elements have classes prefixed with `yuno-*` so you can overwrite their styles using those classes.  

By default the font that we use is `Inter` so if you want this font you should add the following link tag into your html

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto&display=swap"
  rel="stylesheet"
/>
```
[Using Inter font](https://github.com/yuno-payments/yuno-sdk-web/blob/main/index.html#L12) 

or you can apply your own font using CSS 
```css
[class*=yuno] {
  font-family: YOUR_FONT;
}
```

## Typescript

#### Install the type definitions SDK using npm

```sh
npm install @yuno-payments/sdk-web-types
```

[@yuno-payments/sdk-web-types](https://www.npmjs.com/package/@yuno-payments/sdk-web-types)

### implementación

Include Type in tsconfig.js or tsconfig.json

```javascript
{
  "compilerOptions": {
    ....
    "types": ["@yuno-payments/sdk-web-types"]
  },
  ...
}
```

how to use types in your code

```javascript
import { YunoInstance } from '@yuno-payments/sdk-web-types/dist/types'
const yunoInstance: YunoInstance = Yuno.initialize('publickAPikey')
```
