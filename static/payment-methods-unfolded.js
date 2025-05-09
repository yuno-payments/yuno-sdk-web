import { getCheckoutSession, createPayment, getPublicApiKey, getPaymentMethods } from "./api.js"
import { createListPaymentMethods, hideLoader, resetStateList, showContent, showFormContent } from "./utils.js"

async function initCheckout() {
  const { checkout_session: checkoutSession, country: countryCode } = await getCheckoutSession()
  const publicApiKey = await getPublicApiKey()
  const paymentMethodsList = await getPaymentMethods(checkoutSession)

  const yunoInstance = await Yuno.initialize(publicApiKey)

  const loadChekoutLite = async (paymentMethod, optionId) => {
    resetStateList(paymentMethodsList)
    showContent(optionId)

    await yunoInstance.startCheckout({
      checkoutSession,
      elementSelector: "#root",
      countryCode,
      language: 'en',
      showLoading: false,
      showPayButton: false,
      yunoCreatePayment: async (oneTimeToken) => {
        try {
          const response = await createPayment({ oneTimeToken, checkoutSession })
          //verify if the payment method requires an action
          if (response.checkout.sdk_action_required) {
            await yunoInstance.continuePayment()
          } else {
            //mount the status payment
            yunoInstance.mountStatusPayment({
              checkoutSession,
              language: 'en',
              countryCode,
              yunoPaymentResult: async (data) => {
                //When closing the screen, if the user wants to retry, a new checkout session must be created because the previous one has already been used
                resetStateList(paymentMethodsList)
              }
            })

          }
        } catch (error) {
          console.log('There was an error', error)
        } finally {
          yunoInstance.hideLoader()
        }
      },
      onLoading: ({ type, isLoading }) => {
        console.log('onLoading', { type, isLoading })
        if (type === 'DOCUMENT' && !isLoading) {
          showFormContent(optionId)
          hideLoader(optionId)
          return
        }

        if (type === 'ONE_TIME_TOKEN' && isLoading) {
          yunoInstance.showLoader()
          return
        }
      },
      renderMode: {
        type: 'element',
        elementSelector: {
          apmForm: `#form-${optionId}`,
        }
      },
      card: {
        styles: `
          .Yuno-fieldset {
            background: transparent !important;
          } 
        `
      }
    })

    yunoInstance.mountCheckoutLite({
      paymentMethodType: paymentMethod.type,
      vaultedToken: paymentMethod.vaulted_token,
    })
  }

  createListPaymentMethods(paymentMethodsList, loadChekoutLite)

  document.getElementById('btn-pay').addEventListener('click', async () => {
    yunoInstance.submitOneTimeTokenForm()
  })
}

window.addEventListener('yuno-sdk-ready', initCheckout)
