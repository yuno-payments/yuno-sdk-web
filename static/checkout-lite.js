import { getCheckoutSession, createPayment, getPublicApiKey } from "./api.js"

async function initCheckoutLite() {
  // get checkout session from merchan back
  const { checkout_session: checkoutSession, country: countryCode } = await getCheckoutSession()
  /**
   * this should be provided by the merchant
   * can be one of 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO | CARD
   */
  const PAYMENT_METHOD_TYPE = 'CARD'
  // this should be provided by the merchant
  const VAULTED_TOKEN = null

  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = await Yuno.initialize(publicApiKey)
  /**
   * checkout configuration
   */
  await yuno.startCheckout({ 
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
     * callback is called when one time token is created,
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
     * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
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
    /**
     * Required if you'd like to be informed if there is a server call
     * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
     * @optional
     */
    onLoading: (args) => {
      console.log('onLoading', args);
    }
  })

  yuno.mountCheckoutLite({
    /**
     * can be one of 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO
     */
    paymentMethodType: PAYMENT_METHOD_TYPE,
    /**
     * Vaulted token related to payment method type
     */
    vaultedToken: VAULTED_TOKEN,
  })
}

window.addEventListener('yuno-sdk-ready', initCheckoutLite)
