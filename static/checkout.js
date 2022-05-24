import { getCheckoutSession, createPayment, publicApiKey } from "./api.js"

async function initCheckout () {
  // get checkout session from merchan back
  const { checkout_session, country } = await getCheckoutSession()

  // start Yuno SDK
  const yuno = new Yuno(publicApiKey)

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

  /**
   * mount checkout in browser DOM
   */
  yuno.mountCheckout({ 
    checkoutSession: checkout_session,
    // element where the SDK will be mount on
    element: '#root', 
    config 
  })


  // start payment when user clicks on merchant payment button
  const PayButton = document.querySelector('#button-pay')
  
  PayButton.addEventListener('click', () => {
    yuno.startPayment()
  })
}

window.addEventListener('load', initCheckout)