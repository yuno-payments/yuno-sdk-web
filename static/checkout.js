import { getCheckoutSession, createPayment, getPublicApiKey } from "./api.js"

async function initCheckout () {
  // get checkout session from merchan back
  const { checkout_session: checkoutSession, country: countryCode } = await getCheckoutSession()

  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = Yuno.initialize(publicApiKey)
  /**
   * checkout configuration
   */
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
     *  Hide or show the Yuno loading/spinner page
     *  default is true
     */
    showLoading: true,
    /**
     *  Enable this will keep showing the loading component until either hideLoader() or 
     *  continuePayment() are called.
     *  Default is true
     */
    keepLoader: true,
    /**
     * 
     * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
     */
    onLoading: (args) => {
      console.log(args);
    },
    /**
     * Where the forms a shown
     * default { type: 'modal' }
     */
    renderMode: {
      /**
       * type can be one of `modal` or `element`
       * default modal
       */
      type: 'modal',
      /**
       * element where the form will be rendered
       * only needed if type is element
       */
      elementSelector: '#form-element',
    },
    /**
     *  API card
     */
    card: {
      /**
       * mode render card can be step or extends
       * default extends
       */
      type: "extends",
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-front-side-card__name-label { 
       *    color: red !important;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: '',
    },
    /**
     * Use external SDKs buttons like PayPal, Paga con Rappi
     */
    externalPaymentButtons: {
      paypal: {
        elementSelector: '#paypal',
      }
    },
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
     * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO', name: string} } data 
     */
    yunoPaymentMethodSelected(data) {
      console.log('onPaymentMethodSelected', data)
    },
    /**
     * 
     * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
     */
    yunoPaymentResult(data) {
      console.log('yunoPaymentResult', data)
      /**
       * call if you set `keepLoader = true` and you want to hide the loader 
       */
      yuno.hideLoader()
    },
    /**
     * @param { error: 'CANCELED_BY_USER' | any }
     */
    yunoError: (error) => {
      console.log('There was an error', error)
      /**
       * call if you set `keepLoader = true` and you want to hide the loader 
       */
      yuno.hideLoader()
    },
  })

  /**
   * mount checkout in browser DOM
   */
  yuno.mountCheckout()


  // start payment when user clicks on merchant payment button
  const PayButton = document.querySelector('#button-pay')
  
  PayButton.addEventListener('click', () => {
    yuno.startPayment()
  })
}

window.addEventListener('load', initCheckout)