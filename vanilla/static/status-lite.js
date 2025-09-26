import { getPublicApiKey } from './api.js'

async function initStatus() {
  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = await Yuno.initialize(publicApiKey)

  const checkoutSession = '438413b7-4921-41e4-b8f3-28a5a0141638'

  /**
   * Call method that returns status
   * 
   * @return {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'}
   */
  const status = await yuno.yunoPaymentResult(checkoutSession)

  document.write(`Payment Status: ${status}`)
}

window.addEventListener('yuno-sdk-ready', initStatus)
