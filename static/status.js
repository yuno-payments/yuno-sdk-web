import { getPublicApiKey } from './api.js'

async function initStatus() {
  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = Yuno.initialize(publicApiKey)
  /**
   * Mount status in the DOM
   */
  yuno.mountStatusPayment({
    checkoutSession: 'b5c3ee12-cbf6-4097-83c3-a723e9c235ad',
    /**
     * country can be one of CO, BR, CL, PE, EC, UR, MX
     */
    countryCode: 'CO',
    /**
    * language can be one of es, en, pt
    */
    language: 'es',
    /**
     * 
     * @param {*} data 
     */
    yunoPaymentResult(data) {
      console.log('yunoPaymentResult', data)
    }
  })
}

window.addEventListener('load', initStatus)