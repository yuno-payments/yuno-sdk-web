# yuno-sdk-web

## Table of Contents

  - [Browser Requirements](#browser-requirements)
  - [Use Full Checkout](#use-full-checkout)
  - [Use Checkout Lite](#use-checkout-lite)
  - [Use Status](#use-status)
  - [Start Demo App](#start-demo-app)
## Browser Requirements

* Any browser that supports [gRPC](https://grpc.io/blog/state-of-grpc-web/)
* We don't support IE 


## Use Full Checkout

To use full checkout you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.dev.y.uno/static/js/main.min.js"></script>
```

Instantiate `Yuno` class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = new Yuno(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
 /**
 * configurations
 */
const config = {
  /**
   * callback is called when user selects a payment method
   * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY', name: string} } data 
   */
  onSelected(data) {
    console.log('onSelected', data)
  },

  /**
   * calback is called when one time token is created,
   * merchant should create payment back to back
   * @param { {oneTimeToken: string, checkoutSession: string}  } data 
   */
  async onPay(data) {
    // merchant should create payment back to back
    await createPayment(data)
    // after payment is create the SDK should continue its flow
    yuno.paymentCreated()
  },
  /**
   * country can be one of CO, BR, CL, PE, EC, UR, MX
   */
  country,
}
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
/**
 * mount checkout in browser DOM
 */
yuno.mountCheckout({ 
  // you need a valid checkout session
  checkoutSession,
  // element where the SDK will be mount on
  element: '#root', 
  config 
})
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
<script src="https://sdk-web.dev.y.uno/static/js/main.min.js"></script>
```

Instantiate `Yuno` class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = new Yuno(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
/**
 * configurations
 */
const config = {
  /**
   * calback is called when one time token is created,
   * merchant should create payment back to back
   * @param { {oneTimeToken: string, checkoutSession: string}  } data 
   */
  async onPay(data) {
    // merchant should create payment back to back
    await createPayment(data)
    // after payment is create the SDK should continue its flow
    yuno.paymentCreated()
  },
  country,
}
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
yuno.mountCheckoutLite({ 
  // you need a valid checkout session
  checkoutSession,
  // you need a valid type 'BANCOLOMBIA_TRANSFER' | 'ADDI' | 'PIX' | 'NU_PAY
  type,
  // you need a valid type
  valutedToken,
  // element where the SDK will be mount on
  element: '#root',
  config 
})
```

After it is mounted, it will start the desired flow

[Checkout lite demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/checkout-lite.html)  
[Checkout lite demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/checkout-lite.js)

## Use Status

To use status you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.dev.y.uno/static/js/main.min.js"></script>
```

Instantiate `Yuno` class in your `JS` app with a valid **PUBLIC_API_KEY**

```javascript
const yuno = new Yuno(PUBLIC_API_KEY)
```

Then create a configuration object

```javascript
/**
 * configurations
 */
const config = {
  /**
   * 
   * @param {{ status: 'CREATED' | 'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED'}} data 
   */
  onStatus(data) {
    console.log('onStatus', data)
  },
}
```

Finally mount the **SDK** in a `html` element, you can use any valid css selector (`#`, `.`, `[data-*]`).

```javascript
yuno.mountStatus({ 
  // element where the SDK will be mount on
  element: '#root',
  config 
})
```

When you use this you should add the `checkout-session` query parameter to your URL with the `checkoutSession` you want to check its status like `?checkout-session=438413b7-4921-41e4-b8f3-28a5a0141638`

[Status demo html](https://github.com/yuno-payments/yuno-sdk-web/blob/main/status.html)  
[Status demo js](https://github.com/yuno-payments/yuno-sdk-web/blob/main/static/status.js)


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
```

Then got to [http://localhost:YOUR-PORT](http://localhost:YOUR-PORT)