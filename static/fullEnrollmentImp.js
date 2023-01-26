import { getPublicApiKey } from "./api.js"

const checkoutSession = '123'
const customerSession = 'db7d5c88-c6f2-4e7a-8e1d-055c6c5949aa'
const countryCode = 'CO'

async function initFullEnrollmentImp () {
  const publicApiKey = await getPublicApiKey()
  // start Yuno SDK
  const yuno = Yuno.initialize(publicApiKey)
  console.log("🚀 , file: fullEnrollmentImp.js:10 , initFullEnrollmentImp , yuno", yuno)
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

window.addEventListener('load', initFullEnrollmentImp)