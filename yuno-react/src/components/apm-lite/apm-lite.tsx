/* eslint-disable react/prop-types */
/* eslint-disable no-empty */
import { useContext, useEffect } from "react"
import { AppContext } from "../../context/app-context"

export const ApmLite: React.FC<{
  paymentMethodType: string,
  vaultedToken?: string,
  onClose: () => void
}> = ({ paymentMethodType, vaultedToken, onClose }) => {
  const { checkoutSession, countryCode, yunoInstance } = useContext(AppContext)

  useEffect(() => {
    const mountApmLite = async () => {
      await yunoInstance.startCheckout({
        checkoutSession,
        elementSelector: "#root-apm-yuno",
        countryCode,
        language: 'es',
        yunoCreatePayment: async (token) => {
          console.log('token ----->', token)
          try {
            await yunoInstance.continuePayment()
          } catch (error) {
          } finally {
            onClose()
          }
        },
        yunoError: (err) => {
          if (err === 'CANCELED_BY_USER') {
            onClose()
          }
        }
      })
      yunoInstance.mountCheckoutLite({
        paymentMethodType,
        vaultedToken
      })
    }
    mountApmLite()
  }, [])

  return <div id="root-apm-yuno"></div>
}
