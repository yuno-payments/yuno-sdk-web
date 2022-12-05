import { getCustomerSession, createEnrollment, getPublicApiKey } from './api.js'

async function initEnrollmentLite() {
  // get customer session from merchan back
  const { customer_session: customerSession, country: countryCode } = await getCustomerSession()

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
