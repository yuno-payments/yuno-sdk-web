import { publicApiKey } from './api.js'

function initStatus() {
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
  }

  yuno.mountStatus({ 
    checkoutSession: '438413b7-4921-41e4-b8f3-28a5a0141638',
    // element where the SDK will be mount on
    element: '#root',
    config,
  })
}

window.addEventListener('load', initStatus)