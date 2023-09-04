const PUBLIC_API_KEY = ''
const CHECKOUT_SESSION = ''
const PAYMENT_METHOD_TYPE = 'CARD'
const VAULTED_TOKEN = null

export const startPayment = async () => {
  const yuno = window.Yuno.initialize(PUBLIC_API_KEY)

  yuno.startCheckout({
    checkoutSession: CHECKOUT_SESSION,
    elementSelector: '#yuno-root',
    countryCode: 'CO',
    language: 'es',
    async yunoCreatePayment(oneTimeToken, tokenWithInformation) {
      alert(`Token: ${oneTimeToken}`)
      console.log('token', oneTimeToken, tokenWithInformation)
    }
  })

  yuno.mountCheckoutLite({
    paymentMethodType: PAYMENT_METHOD_TYPE,
    vaultedToken: VAULTED_TOKEN
  })
}