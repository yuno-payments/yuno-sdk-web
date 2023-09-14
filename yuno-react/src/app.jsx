import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AppContext } from './context/app-context'
import { useMemo, useRef } from 'react'

const checkoutSession = '0360702d-d089-4a06-be9a-cd39f5b37ac6'
const publicApiKey = 'staging_gAAAAABjnL4O3-hbUTovDItjvG-EjV3WNkZyrxDvqMphxOVqbBp5e4RlxJZNk0hF-Er_baVq3fgQeN3WR9pT9Fvfha-glV5vMtp-tTGwfGEcl2HZfCttq77I_Ql24gabCSvN5xTkrikRJwC9A2g5aHpVm37nnIfCgdt-rNNoVpjvSFpM15FIpj8='

export const App = () => {
  const instanceFlag = useRef(0)
  const yunoInstance = useMemo(() => {
    if (instanceFlag.current !== 0) {
      return
    }
    instanceFlag.current = 1
    return window.Yuno.initialize(publicApiKey)
  }, [])

  return <AppContext.Provider value={{ checkoutSession, yunoInstance, countryCode: 'CO' }}>
    <RouterProvider router={router} />
  </AppContext.Provider>
}