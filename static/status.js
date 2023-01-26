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
    checkoutSession: '5a83b02e-116a-4d1d-8a89-16ae9e463125',
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
     * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
     */
    yunoPaymentResult(data) {
      console.log('yunoPaymentResult', data)
    }
  })
}

window.addEventListener('load', initStatus)