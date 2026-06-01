import { createContext } from 'react'
import type { YunoInstance } from '@yuno-payments/sdk-web-types'

type AppContextType = {
  checkoutSession: string
  countryCode: string
  yunoInstance: YunoInstance
  canaryMode: boolean
  setCanaryMode: (enabled: boolean) => void
}

export const AppContext = createContext<AppContextType>({
  checkoutSession: '',
  countryCode: '',
  yunoInstance: {} as YunoInstance,
  canaryMode: false,
  setCanaryMode: () => {},
})
