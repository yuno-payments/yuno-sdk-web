import { getCheckoutSession, createPayment } from "./api.js"

async function initCheckout () {
  const { checkout_session, country } = await getCheckoutSession()
  const yuno = new window.Yuno()

  const config = {
    onSelected: (data) => {
      console.log('onSelected', data)
    },
    onPay: async (data) => {
      await createPayment(data)
      yuno.paymentCreated()
    },
    country,
  }
  console.log('checkout_session', checkout_session)
  yuno.mountCheckout({ 
    checkoutSession: checkout_session,
    element: '#root', 
    config 
  })

  return yuno
}

window.addEventListener('load', initCheckout)