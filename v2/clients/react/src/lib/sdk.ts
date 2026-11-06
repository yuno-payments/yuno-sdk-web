// Loads the Universal SDK (v2) once and exposes window.SdkPayments.
//
// v2 releases are published at full-version paths only (there is no /v2.2/), so the pin is exact.
// Bump it here and nowhere else.
import type { SdkPaymentsStatic, TransactionStatus } from '../../../../types/sdk-payments'

export const SDK_URL = 'https://sdk-web.y.uno/v2.2.0/main.js'

let sdkPromise: Promise<SdkPaymentsStatic> | undefined

export function loadSdk(): Promise<SdkPaymentsStatic> {
  sdkPromise ??= new Promise((resolve, reject) => {
    if (window.SdkPayments) return resolve(window.SdkPayments)
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => (window.SdkPayments ? resolve(window.SdkPayments) : reject(new Error('SDK loaded but window.SdkPayments is missing')))
    script.onerror = () => reject(new Error(`Could not load ${SDK_URL}`))
    document.head.appendChild(script)
  })
  return sdkPromise
}

export function formatStatus(result: TransactionStatus): string {
  console.log('[onStatus]', result)
  return [result.status, result.message?.code].filter(Boolean).join(' · ')
}
