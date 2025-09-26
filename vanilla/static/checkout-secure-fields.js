import { getCheckoutSession, createPayment, getPublicApiKey } from "./api.js"
import { dispatchLoaderEvent } from './loader.js'
import { watchedObject } from './watched-object.js'
import { disabledButton, enableLoadingButton, showButton } from './button.js'


function shouldHideLoader(state) {
  const allTrue = Object.values(state).every(value => value === true);
  if (allTrue) {
    dispatchLoaderEvent({ showLoader: false })
    showButton({ show: true })
  }
}

function shouldEnableButton(state){
  const enable = Object.values(state).every(value => value === false);
  disabledButton({ disabled: !enable })
}

async function initCheckoutSecureFields() {
  const renderState = watchedObject({
    pan: false,
    expiration: false,
    cvv: false
  }, shouldHideLoader)

  const errorState = watchedObject({
    pan: true,
    expiration: true,
    cvv: true
  }, shouldEnableButton)

  // get checkout session from merchant back
  const { checkout_session: checkoutSession, country: countryCode } = await getCheckoutSession()

  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = await Yuno.initialize(publicApiKey)
  /**
   * checkout configuration
   */
  const secureFields = await yuno.secureFields({
    countryCode,
    checkoutSession,
    /**
     * disabled or enable the functionality of the installment
     * default is false
     */
    installmentEnable: false
  })

  const secureNumber = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'pan',
    // All options are optional
    options: {
      placeholder: '0000 0000 0000 0000',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'Card Number',
      showError: true,
      // Indicates if the fields has error
      // If you have installmentEnable set to true, the data will include the installments property
      /**
       * 
       * data : {
       *  installments: [{
       *    {
              "installmentId": "10cef26f-7d5e-4783-89ee-e00f7ed93b64",
              "installment": 1,
              "amount": {
                  "currency": "COP",
                  "value": "2200",
                  "total_value": "2200"
              }
            },
           {
              "installmentId": "10cef26f-7d5e-4783-89ee-e00f7ed93b64",
              "installment": 12,
              "amount": {
                  "currency": "COP",
                  "value": "2200",
                  "total_value": "2200"
              }
            }
       *  }]
       * }
       */
      onChange: ({ error, data }) => {
        errorState.pan = error
        if (error) {
          console.log('error_pan')
        } else {
          console.log('not_error_pan')
        }
        console.log(data.installments)
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_pan')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_pan')
      },
      onRenderedSecureField: () => {
        renderState.pan = true
      }
    },
  })

  // Render into desired element
  secureNumber.render('#pan')

  const secureExpiration = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'expiration',
    // All options are optional
    options: {
      placeholder: 'MM / YY',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'Card Expiration',
      showError: true,
      // Indicates if the fields has error
      onChange: ({ error }) => {
        errorState.expiration = error
        if (error) {
          console.log('error_expiration')
        } else {
          console.log('not_error_expiration')
        }
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_expiration')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_expiration')
      },
      onRenderedSecureField: () => {
        renderState.expiration = true
      }
    },
  })

  // Render into desired element
  secureExpiration.render('#expiration')


  const secureCvv = secureFields.create({
    /**
     * Fields name, can be 'cvv' | 'pan' | 'expiration'
     */
    name: 'cvv',
    // All options are optional
    options: {
      placeholder: 'CVV',
      /**
       * you can edit card form styles
       * only you should write css then it will be injected into the iframe
       * example 
       * `@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
       *  .Yuno-text-field__content.focus label.Yuno-text-field__label {
       *    color: red;
       *    font-family: 'Luckiest Guy' !important;
       *   }`
       */
      styles: ``,
      label: 'CVV',
      showError: true,
      // Indicates if the fields has error
      onChange: ({ error }) => {
        errorState.cvv = error
        if (error) {
          console.log('error_cvv')
        } else {
          console.log('not_error_cvv')
        }
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_cvv')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_cvv')
      },
      onRenderedSecureField: () => {
        renderState.cvv = true
      }
    },
  })

  // Render into desired element
  secureCvv.render('#cvv')

  // start payment when user clicks on merchant payment button
  const PayButton = document.querySelector('#button-pay')

  PayButton.addEventListener('click', async () => {
    enableLoadingButton({ loading: true })
    // Create One Time Token
    // This will trigger an error if there are missing data
    // You can catch it using a try/catch
    const oneTimeToken = await secureFields.generateToken({
      // Required: You can create an input to get this formation
      cardHolderName: 'John Deer',
      // Optional: You can create an input to get this formation
      saveCard: true,
      // Check your card processor to know if you need to send 
      // customer information
      // full object here https://docs.y.uno/reference/the-customer-object
      customer: {
        document: {
          document_number: '1090209924',
          document_type: 'CC',
        },
      },
    })

    // Create your payment, you should implement this function
    await createPayment({ oneTimeToken, checkoutSession })

    enableLoadingButton({ loading: false, previousText: 'Pay Now' })

    // Check payment status
    yuno.mountStatusPayment({
      checkoutSession: checkoutSession,
      /**
       * Country can be one of CO, BR, CL, PE, EC, UR, MX
       */
      countryCode: 'CO',
      /**
       * Language can be one of es, en, pt
       */
      language: 'en',
      /**
       * @param {'READY_TO_PAY' | 'CREATED' | 'SUCCEEDED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
       */
      yunoPaymentResult(data) {
        console.log('yunoPaymentResult', data)
      },
    })
  })
}

window.addEventListener('yuno-sdk-ready', initCheckoutSecureFields)
