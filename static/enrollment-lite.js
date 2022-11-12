import { getCustomerSession, createEnrollment, getPublicApiKey } from './api.js'

async function initEnrollmentLite() {
  // get customer session from merchan back
  const { customer_session: customerSession } = await getCustomerSession()

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
     * @param { error: 'CANCELED_BY_USER' | any }
     */
    yunoError: () => {
      console.log('There was an error', error)
    },
  });
}

window.addEventListener('load', initEnrollmentLite)
