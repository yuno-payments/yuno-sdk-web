import { getCheckoutSession, createPayment, getPublicApiKey } from "./api.js"

async function initCheckoutSecureFields () {
  // get checkout session from merchant back
  const { checkout_session: checkoutSession, country: countryCode } = await getCheckoutSession()

  // get api key
  const publicApiKey = await getPublicApiKey()

  // start Yuno SDK
  const yuno = Yuno.initialize(publicApiKey)
  /**
   * checkout configuration
   */
  const secureFields = yuno.secureFields({
    countryCode,
    checkoutSession,
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
      onChange: ({ error }) => {
        if (error) {
          console.log('error_pan')
        } else {
          console.log('not_error_pan')
        }
      },
      // Trigger when blurring from input
      onBlur() {
        console.log('blur_pan')
      },
      // Trigger when focussing on input
      onFocus: () => {
        console.log('focus_pan')
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
      }
    },
  })

  // Render into desired element
  secureCvv.render('#cvv')

  // start payment when user clicks on merchant payment button
  const PayButton = document.querySelector('#button-pay')
  
  PayButton.addEventListener('click', async () => {
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
       * @param {'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED' | 'PENDING' | 'EXPIRED' | 'VERIFIED' | 'REFUNDED'} data
       */
      yunoPaymentResult(data) {
        console.log('yunoPaymentResult', data)
      },
    })
    
  })
}

window.addEventListener('load', initCheckoutSecureFields)
