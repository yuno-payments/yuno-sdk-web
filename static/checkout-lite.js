import { getCheckoutSession, createPayment, publicApiKey } from "./api.js"

async function initCheckoutLite() {
  // get checkout session from merchan back
  const { checkout_session, country } = await getCheckoutSession()
  // this should be provided by the merchant
  const TYPE = 'BANCOLOMBIA_TRANSFER'
  // this should be provided by the merchant
  const VAULTED_TOKEN = null

  // start Yuno SDK
  const yuno = new Yuno(publicApiKey)

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

  yuno.mountCheckoutLite({ 
    checkoutSession: checkout_session,
    type: TYPE,
    // element where the SDK will be mount on
    element: '#root',
    valutedToken: VAULTED_TOKEN,
    config 
  })
}

window.addEventListener('load', initCheckoutLite)