import { getSeamlessCheckoutSession, getPublicApiKey } from "./api.js"

let yuno = null

async function initCheckoutSeamlessLite() {
  // get checkout session from merchan back
  const { checkout_session: checkoutSession, country: countryCode } = await getSeamlessCheckoutSession()

  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  yuno = await window.Yuno.initialize(publicApiKey)
  /**
   * checkout configuration
   */
  await yuno.startSeamlessCheckout({
    checkoutSession,
    // element where the SDK will be mount on
    elementSelector: '#root',
    /**
     * country can be one of CO, BR, CL, PE, EC, UR, MX
     */
    countryCode,
    /**
      * language can be one of es, en, pt
      */
    language: 'es',
    /**
     * Where the forms a shown
     * default { type: 'modal' }
     */
    renderMode: {
      /**
       * type can be one of modal or element
       * default modal
       */
      type: 'element',
      // type: 'modal',
      /**
       * element where the form will be rendered
       * only needed if type is element
       */
      elementSelector: '#form-element',
    },
    /**
     * 
     * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
     */
    yunoPaymentResult(data) {
      console.log('yunoPaymentResult', data)
    },
    /**
     * @param { error: 'CANCELED_BY_USER' | any }
     */
    yunoError: (error) => {
      console.log('There was an error', error)
    },
    onLoading: (data) => {
      console.log('onLoading', data)
    },
    onRendered: () => {
      console.log("termino el render")
    },
    onCreateOneTimeToken: () => {
      console.log("creando ott")
    },
    /**
     * callback is called when user selects a payment method
     * @param { {type: 'BANCOLOMBIA_TRANSFER' | 'PIX' | 'ADDI' | 'NU_PAY' | 'MERCADO_PAGO_CHECKOUT_PRO', name: string} } data
     */
    yunoPaymentMethodSelected(data) {
      console.log('onPaymentMethodSelected', data)
    },
  })

  yuno.mountSeamlessExternalButtons([
    {
      paymentMethodType: 'PAYPAL',
      elementSelector: '#paypal',
    },
    
    {
      paymentMethodType: 'APPLE_PAY',
      elementSelector: '#apple-pay',
    },
    {
      paymentMethodType: 'GOOGLE_PAY',
      elementSelector: '#google-pay',
    },
    // {
    //   paymentMethodType: 'PAYPAL_ENROLLMENT',
    //   elementSelector: '#paypal',
    // },
  ])
}

function unmountAll() {
  yuno.unmountSeamlessExternalButtons()
}

function unmountPaypal() {
  yuno.unmountSeamlessExternalButton('PAYPAL')
}

function unmountApplePay() {
  yuno.unmountSeamlessExternalButton('APPLE_PAY')
}

function unmountGooglePay() {
  yuno.unmountSeamlessExternalButton('GOOGLE_PAY')
}

async function mountAll() {
  const { checkout_session: checkoutSession } = await getSeamlessCheckoutSession()

  yuno.mountSeamlessExternalButtons([
    {
      paymentMethodType: 'PAYPAL',
      elementSelector: '#paypal',
      checkoutSession,
    },
    
    {
      paymentMethodType: 'APPLE_PAY',
      elementSelector: '#apple-pay',
      checkoutSession,
    },
    {
      paymentMethodType: 'GOOGLE_PAY',
      elementSelector: '#google-pay',
      checkoutSession,
    },
    // {
    //   paymentMethodType: 'PAYPAL_ENROLLMENT',
    //   elementSelector: '#paypal',
    // },
  ])
}

async function mountPaypal() {
  const { checkout_session: checkoutSession } = await getSeamlessCheckoutSession()
  yuno.mountSeamlessExternalButtons([{
    paymentMethodType: 'PAYPAL',
    elementSelector: '#paypal',
    checkoutSession,
    }])
}

async function mountApplePay() {
  const { checkout_session: checkoutSession } = await getSeamlessCheckoutSession()
  yuno.mountSeamlessExternalButtons([{
    paymentMethodType: 'APPLE_PAY',
    elementSelector: '#apple-pay',
    checkoutSession,
    }])
}

async function mountGooglePay() {
  const { checkout_session: checkoutSession } = await getSeamlessCheckoutSession()
  yuno.mountSeamlessExternalButtons([{
    paymentMethodType: 'GOOGLE_PAY',
    elementSelector: '#google-pay',
    checkoutSession,
    }])
  
}

async function unmountPaypalEnrollment() {
  yuno.unmountSeamlessExternalButtons(['PAYPAL_ENROLLMENT'])
}

async function mountPaypalEnrollment() {
  const { checkout_session: checkoutSession } = await getSeamlessCheckoutSession()
  yuno.mountSeamlessExternalButtons([{
    paymentMethodType: 'PAYPAL_ENROLLMENT',
    elementSelector: '#paypal',
    checkoutSession,
    }])
  
}

document.getElementById('unmount-all').addEventListener('click', unmountAll)
document.getElementById('unmount-paypal').addEventListener('click', unmountPaypal)
document.getElementById('unmount-apple-pay').addEventListener('click', unmountApplePay)
document.getElementById('unmount-google-pay').addEventListener('click', unmountGooglePay)
document.getElementById('mount-all').addEventListener('click', mountAll)
document.getElementById('mount-paypal').addEventListener('click', mountPaypal)
document.getElementById('mount-apple-pay').addEventListener('click', mountApplePay)
document.getElementById('mount-google-pay').addEventListener('click', mountGooglePay)
document.getElementById('unmount-paypal-enrollment').addEventListener('click', unmountPaypalEnrollment)
document.getElementById('mount-paypal-enrollment').addEventListener('click', mountPaypalEnrollment)

window.addEventListener('yuno-sdk-ready', initCheckoutSeamlessLite)
