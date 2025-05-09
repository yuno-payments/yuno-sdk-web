import { createContext } from 'react'
import type { YunoInstance } from '@yuno-payments/sdk-web-types'

type AppContextType = {
  checkoutSession: string
  countryCode: string
  yunoInstance: YunoInstance
}

export const AppContext = createContext<AppContextType>({ checkoutSession: '', countryCode: '', yunoInstance: {} as YunoInstance })
