import { getSeamlessCheckoutSession, getPublicApiKey } from "./api.js"

async function initSeamlessCheckoutLite() {
  // get checkout session from merchan back
  const { checkout_session: checkoutSession, country: countryCode } = await getSeamlessCheckoutSession()
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
     * Empty function.  Won't be called, 
     */
    async yunoCreatePayment() { },
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

  yuno.mountSeamlessCheckoutLite({
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

window.addEventListener('yuno-sdk-ready', initSeamlessCheckoutLite)
