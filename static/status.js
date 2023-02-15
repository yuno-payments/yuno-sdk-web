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
    checkoutSession: '15982c57-722b-43bb-9ef8-1d11eb10be50',
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
      if(data==='SUCCEEDED'){
        window.location.replace("https://www.youtube.com/")
      }
    }
  })
}

window.addEventListener('load', initStatus)