import { getPublicApiKey } from './api.js'

function initStatus() {
  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = new Yuno(publicApiKey)
  /**
   * configurations
   */
  const config = {
    /**
     * 
     * @param {{ status: 'CREATED' | 'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED'}} data 
     */
    onStatus(data) {
      console.log('onStatus', data)
    },
    country: 'CO'
  }

  yuno.mountStatus({ 
    checkoutSession: '00d45705-5322-4edc-8c1b-6038acbabe07',
    // element where the SDK will be mount on
    element: '#root',
    config,
  })
}

window.addEventListener('load', initStatus)