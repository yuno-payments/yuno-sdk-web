import { useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '../../context/app-context'
import { Button } from '../button'
import { ContentForm } from './card-form-styled'

export const CardForm = () => {
  const { checkoutSession, countryCode, yunoInstance } = useContext(AppContext)
  const renderedFlag = useRef(0)

  const secureFieldsInstance = useMemo(() => yunoInstance.secureFields({
    countryCode,
    checkoutSession
  }), [])

  const generateOTT = () => {
    secureFieldsInstance.generateToken({
      cardHolderName: 'Name Test',
      customer: {
        document: {
          document_number: '90209924',
          document_type: 'CC'
        }
      }
    }).then((token) => {
      console.log('tokennnn ---->>>>', token)
    })
  }

  useEffect(() => {
    if (renderedFlag.current !== 0) {
      return
    }
    renderedFlag.current = 1

    const panFields = secureFieldsInstance.create({
      name: 'pan',
      options: {
        label: 'pan',
        showError: true
      }
    })

    const expirationFields = secureFieldsInstance.create({
      name: 'expiration',
      options: {
        label: 'MM/YY',
        showError: true
      }
    })

    const cvvFields = secureFieldsInstance.create({
      name: 'cvv',
      options: {
        label: 'CVV',
        showError: true
      }
    })

    panFields.render('#pan')
    expirationFields.render('#expiration')
    cvvFields.render('#cvv')
  }, [])

  return <ContentForm>
    <div id="pan" />
    <div id="expiration" />
    <div id="cvv" />
    <Button onClick={generateOTT}>Pay</Button>
  </ContentForm>
}
