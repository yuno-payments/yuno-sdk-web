import { getCheckoutSession, createPayment, getPublicApiKey } from "./api.js"

async function initCheckoutLite() {
  // get checkout session from merchan back
  const { checkout_session: checkoutSession, country: countryCode } = await getCheckoutSession()
  // this should be provided by the merchant
  const PAYMENT_METHOD_TYPE = 'BANCOLOMBIA_TRANSFER'
  // this should be provided by the merchant
  const VAULTED_TOKEN = null

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
  })

  yuno.mountCheckoutLite({
    /**
     * can be one of 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO
     */
    paymentMethodType: PAYMENT_METHOD_TYPE,
    /**
     * Vaulted token related to payment method type
     */
    valutedToken: VAULTED_TOKEN,
  })
}

window.addEventListener('load', initCheckoutLite)