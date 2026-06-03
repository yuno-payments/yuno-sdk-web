import { createContext } from 'react'
import type { SdkPaymentsInstance } from '@yuno-payments/sdk-web-types'

type AppContextType = {
  checkoutSession: string
  countryCode: string
  yunoInstance: SdkPaymentsInstance
}

export const AppContext = createContext<AppContextType>({ checkoutSession: '', countryCode: '', yunoInstance: {} as SdkPaymentsInstance })
