import { getCheckoutSession, createPayment } from "./api.js"

async function initCheckout () {
  const { checkout_session, country } = await getCheckoutSession()

  // start Yuno SDK
  const yuno = new Yuno()

  /**
   * configurations
   */
  const config = {
    /**
     * callback is called when user selects a payment method
     * @param {*} data 
     */
    onSelected(data) {
      console.log('onSelected', data)
    },

    /**
     * calback is called when one time token is created,
     * merchant should create payment back to back
     * @param {*} data 
     */
    async onPay(data) {
      await createPayment(data)
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