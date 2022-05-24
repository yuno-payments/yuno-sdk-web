# yuno-sdk-web

## Browser Requirements

* Any browser that supports [gRPC](https://grpc.io/blog/state-of-grpc-web/)
* We don't support IE 


## Use Full Checkout

To use full checkout you should include our **SDK** file in your page before close your `<body>` tag

```html
<script src="https://sdk-web.dev.y.uno/static/js/main.min.js"></script>
```

Instantiate `Yuno` class in your `JS` app

```javascript
const yuno = new Yuno()
```

Then add create a configuration object

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

[Checkout demo html](checkout.html)  
[Checkout demo js](static/checkout.js)