/* eslint-disable react/prop-types */
/* eslint-disable no-empty */
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../context/app-context"

export const ApmLiteCustomLoader: React.FC<{
  paymentMethodType: string,
  vaultedToken?: string,
  onClose: () => void
}> =
  ({ paymentMethodType, vaultedToken, onClose }) => {
    const { checkoutSession, countryCode, yunoInstance } = useContext(AppContext)
    const [showLoader, setShowLoader] = useState(false)

    useEffect(() => {
      const mountApmLite = async () => {
        await yunoInstance.startCheckout({
          checkoutSession,
          elementSelector: "#root-apm-yuno",
          countryCode,
          language: 'es',
          showLoading: false,
          yunoCreatePayment: async (token) => {
            console.log('token ----->', token)
            try {
              await yunoInstance.continuePayment()
            } catch (error) { }
            finally {
              onClose()
              setShowLoader(false)
            }
          },
          yunoError: (err) => {
            if (err === 'CANCELED_BY_USER') {
              onClose()
            }
          },
          onOneTimeTokenCreationStart: () => {
            setShowLoader(true)
          },
          onRendered: () => {
            setShowLoader(false)
          }
        })
        setShowLoader(true)
        yunoInstance.mountCheckoutLite({
          paymentMethodType,
          vaultedToken
        })
      }
      mountApmLite()
    }, [])

    return <>
      <div id="root-apm-yuno"></div>
      {showLoader && <loader-message />}
    </>
  }
