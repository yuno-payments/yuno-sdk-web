# yuno-sdk-web

## Table of Contents

  - [Browser Requirements](#browser-requirements)
  - [Use Full Checkout](#use-full-checkout)
  - [Use Checkout Lite](#use-checkout-lite)
  - [Use Checkout Secure Fields](#use-checkout-secure-fields)
  - [Use Status](#use-status)
  - [Use Enrollment Lite](#use-enrollment-lite)
  - [Start Demo App](#start-demo-app)
  - [CSS Styles](#css-styles)
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
  checkoutSession,
  /**
   * Element where the SDK will be mount on 
   */ 
  elementSelector: '#root', 
  /**
   * country can be one of CO, BR, CL, PE, EC, UR, MX
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
   * Where the forms will be shown
   * Default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * Default modal
     */
    type: 'modal',
    /**
     * Element where the form will be rendered
     * Only needed if type is element
     */
    elementSelector: '#form-element',
  },
  /**
   *  API card
   *  @optional
   */
  card: {
    /**
     * Mode render card can be step or extends
     * Default extends
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
    texts: {}
  },
  /**
   * Custom texts in payment forms buttons 
   * Example:
   * 
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
  texts: {}
  /**
   * Use external SDKs buttons like PayPal, Paga con Rappi
   * @optional
   */
  externalPaymentButtons: {
    paypal: {
      elementSelector: '#paypal',
    },
    pagaConRappi: {
      elementSelector: '#paga-con-rappi',
    },
  },
  /**
   * Callback, is called when the One Time Token is created,
   * Merchant should create payment back to back
   * @param { oneTimeToken: string } data 
   */
  async yunoCreatePayment(oneTimeToken) {
    /**
     * Merchant's function to call its backend to create 
     * the payment into Yuno
     */
    await createPayment({ oneTimeToken, checkoutSession })
    /**
     * Call only if the SDK needs to continue the payment flow
     */
    yuno.continuePayment()
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
  },
  /**
   * If this is called the SDK should be mounted again
   * @param { error: 'CANCELED_BY_USER' | any }
   * @optional
   */
  yunoError: (error) => {
    console.log('There was an error', error)
  },
})
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
/**
 * Mount checkout in browser DOM
 */
yuno.mountCheckout()
```

IF you need to select a payment method by default, mount it using

```javascript
/**
 * Mount checkout in browser DOM with a payment method selected by default
 * @optional
 */
yuno.mountCheckout({
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


## Use Checkout Lite

To use checkout lite you should include our **SDK** file in your page before close your `<body>` tag

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
  checkoutSession,
  /**
   * Element where the SDK will be mount on 
   */ 
  elementSelector: '#root', 
  /**
   * country can be one of CO, BR, CL, PE, EC, UR, MX
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
   * Where the forms will be shown
   * Default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * Default modal
     */
    type: 'modal',
    /**
     * Element where the form will be rendered
     * Only needed if type is element
     */
    elementSelector: '#form-element',
  },
  /**
   *  API card
   *  @optional
   */
  card: {
    /**
     * Mode render card can be step or extends
     * Default extends
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
    texts: {}
  },
  /**
   * Custom texts in payment forms buttons 
   * Example:
   * 
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
  texts: {}
  /**
   * Use external SDKs buttons like PayPal, Paga con Rappi
   * @optional
   */
  externalPaymentButtons: {
    paypal: {
      elementSelector: '#paypal',
    },
    pagaConRappi: {
      elementSelector: '#paga-con-rappi',
    },
  },
  /**
   * Callback, is called when the One Time Token is created,
   * Merchant should create payment back to back
   * @param { oneTimeToken: string } data 
   */
  async yunoCreatePayment(oneTimeToken) {
    /**
     * Merchant's function to call its backend to create 
     * the payment into Yuno
     */
    await createPayment({ oneTimeToken, checkoutSession })
    /**
     * Call only if the SDK needs to continue the payment flow
     */
    yuno.continuePayment()
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
  },
  /**
   * If this is called the SDK should be mounted again
   * @param { error: 'CANCELED_BY_USER' | any }
   * @optional
   */
  yunoError: (error) => {
    console.log('There was an error', error)
  },
})
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
yuno.mountCheckoutLite({
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

## Use Checkout Secure Fields

To use checkout secure fields you should include our **SDK** file in your page before close your `<body>` tag

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
     * country can be one of CO, BR, CL, PE, EC, UR, MX
     */
    countryCode,
    checkoutSession,
  })
```

Configure and mount every secure field and mount them in `html` elements, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
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
// Create your payment, you should implement this function
await createPayment({ oneTimeToken, checkoutSession })

// Check payment status
yuno.mountStatusPayment({
  checkoutSession: checkoutSession,
  /**
   * Country can be one of CO, BR, CL, PE, EC, UR, MX
   */
  countryCode: 'CO',
  /**
   * Language can be one of es, en, pt
   */
  language: 'en',
  /**
   * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
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
   * Country can be one of CO, BR, CL, PE, EC, UR, MX
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
   * country can be one of CO, BR, CL, PE, EC, UR, MX
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
   * Where the forms will be shown
   * Default { type: 'modal' }
   * @optional
   */
  renderMode: {
    /**
     * Type can be one of `modal` or `element`
     * Default modal
     */
    type: 'modal',
    /**
     * Element where the form will be rendered
     * Only needed if type is element
     */
    elementSelector: '#form-element',
  },
  /**
   *  API card
   *  @optional
   */
  card: {
    /**
     * Mode render card can be step or extends
     * Default extends
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
    texts: {}
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
   * @param { error: 'CANCELED_BY_USER' | any }
   * @optional
   */
  yunoError: (error) => {
    console.log('There was an error', error)
  },
});
```
[Enrollment Lite demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/enrollment-lite.html)  
[Enrollment Lite demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/enrollment-lite.js)


## Start Demo App

```sh
> git clone https://github.com/yuno-payments/yuno-sdk-web.git
> cd yuno-sdk-web
> npm install
> npm start
```

You need to create a `.env` file in the root folder with your test keys and server port

```sh
PORT=8080
YUNO_X_ACCOUNT_CODE=abc
YUNO_PUBLIC_API_KEY=abc
YUNO_PRIVATE_SECRET_KEY=abc
YUNO_API_URL=yuno-environment-url
YUNO_CUSTOMER_ID=abc
```

[YUNO_X_ACCOUNT_CODE](https://dashboard.y.uno/developers)  
[YUNO_PUBLIC_API_KEY](https://docs.y.uno/reference/authentication)  
[YUNO_PRIVATE_SECRET_KEY](https://docs.y.uno/reference/authentication)  
[YUNO_API_URL](https://docs.y.uno/reference/introduction)   
[YUNO_CUSTOMER_ID](https://docs.y.uno/reference/create-a-customer)  


Then go to [http://localhost:YOUR-PORT](http://localhost:YOUR-PORT)  

To change the country you can add a query parameter named `country` with one of `CO, BR, CL, PE, EC, UR, MX`  
[http://localhost:YOUR-PORT?country=CO](http://localhost:YOUR-PORT?country=CO)

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
