import { getPublicApiKey } from './api.js'

async function initStatus() {
  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = await Yuno.initialize(publicApiKey)
  /**
   * Mount status in the DOM
   */
  yuno.mountStatusPayment({
    checkoutSession: '438413b7-4921-41e4-b8f3-28a5a0141638',
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
     * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
     */
    yunoPaymentResult(data) {
      console.log('yunoPaymentResult', data)
    }
  })
}

window.addEventListener('yuno-sdk-ready', initStatus)
