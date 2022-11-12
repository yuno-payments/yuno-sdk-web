# yuno-sdk-web

## Table of Contents

  - [Browser Requirements](#browser-requirements)
  - [Use Full Checkout](#use-full-checkout)
  - [Use Checkout Lite](#use-checkout-lite)
  - [Use Status](#use-status)
  - [Use Enrollment Lite](#use-enrollment-lite)
  - [Start Demo App](#start-demo-app)
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
  // element where the SDK will be mount on
  elementSelector: '#root', 
  /**
   * country can be one of CO, BR, CL, PE, EC, UR, MX
   */
  countryCode: country,
  /**
  * language can be one of es, en, pt
  */
  language: 'es',
  /**
   * calback is called when one time token is created,
   * merchant should create payment back to back
   * @param { oneTimeToken: string } data 
   */
  async yunoCreatePayment(oneTimeToken) {
    await createPayment({ oneTimeToken, checkoutSession })

    /**
     * call only if the SDK needs to continue the payment flow
     */
    yuno.continuePayment()
  },
  /**
   * callback is called when user selects a payment method
   * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY', name: string} } data 
   */
  yunoPaymentMethodSelected(data) {
    console.log('onPaymentMethodSelected', data)
  },
  /**
   * 
   * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)
  },
  /**
   * @param { error: 'CANCELED_BY_USER' | any }
   */
  yunoError: (error) => {
    console.log('There was an error', error)
  },
})
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
/**
 * mount checkout in browser DOM
 */
yuno.mountCheckout()
```

Remember you need to call 
```javascript
yuno.startPayment()
```
to start the payment flow after the user has selected a payment method.

```javascript
// start payment when user clicks on merchant payment button
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
  // element where the SDK will be mount on
  elementSelector: '#root', 
  /**
   * country can be one of CO, BR, CL, PE, EC, UR, MX
   */
  countryCode,
  /**
  * language can be one of es, en, pt
  */
  language: 'es',
  /**
   * calback is called when one time token is created,
   * merchant should create payment back to back
   * @param { oneTimeToken: string } data 
   */
  async yunoCreatePayment(oneTimeToken) {
    await createPayment({ oneTimeToken, checkoutSession })

    /**
     * call only if the SDK needs to continue the payment flow
     */
    yuno.continuePayment()
  },
  /**
   * 
   * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
   */
  yunoPaymentResult(data) {
    console.log('yunoPaymentResult', data)
  },
  /**
   * @param { error: 'CANCELED_BY_USER' | any }
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
   * Vaulted token related to payment method type
   */
  valutedToken: VAULTED_TOKEN,
})
```

After it is mounted, it will start the desired flow

[Checkout lite demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/checkout-lite.html)  
[Checkout lite demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/checkout-lite.js)

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
   * country can be one of CO, BR, CL, PE, EC, UR, MX
   */
  countryCode: 'CO',
  /**
  * language can be one of es, en, pt
  */
  language: 'es',
  /**
   * 
   * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
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
 * Call method that returns status
 * 
 * @return {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'}
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
   * language can be one of es, en, pt
   */
  language: "en",
  /**
   * @param { error: 'CANCELED_BY_USER' | any }
   */
  yunoError: () => {
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