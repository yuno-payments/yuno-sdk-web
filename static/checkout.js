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
    }
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