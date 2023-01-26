import { getCustomerSession, createEnrollment, getPublicApiKey } from './api.js'

async function initEnrollmentLite() {
  // get customer session from merchan back
  //const { customer_session: customerSession, country: countryCode } = await getCustomerSession()
  const customerSession = "e1a790ba-1305-4e56-9553-5e074ef23c59"
  const countryCode = "CO"
  // console.log("🚀 , file: enrollment-lite.js:6 , initEnrollmentLite , countryCode", countryCode)
  // console.log("🚀 , file: enrollment-lite.js:6 , initEnrollmentLite , customerSession", customerSession)

  // create enrollment
  await createEnrollment(customerSession)

  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = Yuno.initialize(publicApiKey)

  yuno.mountEnrollmentLite({
    customerSession,
    /**
     * language can be one of es, en, pt
     */
    language: "en",
    /**
     * country can be one of CO, BR, CL, PE, EC, UR, MX
     */
    countryCode,
    /**
     *  Hide or show the Yuno loading/spinner page
     *  default is true
     */
    showLoading: true,
    /**
     * 
     * @param { isLoading: boolean, type: 'DOCUMENT' | 'ONE_TIME_TOKEN'  } data
     */
    onLoading: (args) => {
      console.log(args);
    },
    /**
     * Where the forms a shown
     * default { type: 'modal' }
     */
    renderMode: {
      /**
       * type can be one of `modal` or `element`
       * default modal
       */
      type: 'modal',
      /**
       * element where the form will be rendered
       * only needed if type is element
       */
      elementSelector: '#form-element',
    },
    /**
     * @param { error: 'CANCELED_BY_USER' | any }
     */
    yunoError: () => {
      console.log('There was an error', error)
    },
  });
}

window.addEventListener('load', initEnrollmentLite)
