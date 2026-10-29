// Creates one SDK transaction per component instance and tears it down when the component is destroyed.
//
// Call it from a field initializer (injection context). The setup runs after the first render, so the
// elements the SDK mounts into (#sdk-root, #payment-list, …) exist. transaction.start() is single-shot,
// so the setup runs once; navigating away destroys the component and unmounts the transaction.
import { afterNextRender, DestroyRef, inject, signal } from '@angular/core'
import type { SdkPaymentsStatic, TransactionStatus } from '../../../../../types/sdk-payments'
import { MerchantApi } from './merchant-api.service'
import { YunoSdk } from './yuno-sdk.service'

export interface SetupContext {
  SdkPayments: SdkPaymentsStatic
  publicApiKey: string
  country: string
  language: string
  /** Pass as the config's onStatus: logs the result and shows it in the status line. */
  onStatus: (result: TransactionStatus) => void
}

interface Unmountable { unmount(): Promise<void> }

export function startTransaction<T extends Unmountable>(setup: (ctx: SetupContext) => Promise<T>) {
  const api = inject(MerchantApi)
  const sdk = inject(YunoSdk)
  const status = signal('')
  const transaction = signal<T | undefined>(undefined)

  const onStatus = (result: TransactionStatus) => {
    console.log('[onStatus]', result)
    status.set([result.status, result.message?.code].filter(Boolean).join(' · '))
  }

  let destroyed = false

  afterNextRender(async () => {
    try {
      const [{ publicApiKey, country, language }, SdkPayments] = await Promise.all([api.config(), sdk.load()])
      const created = await setup({ SdkPayments, publicApiKey, country, language, onStatus })
      // The component may be gone by the time the setup resolves: tear the transaction down instead of keeping it.
      if (destroyed) return created.unmount().catch(() => {})
      transaction.set(created)
    } catch (error) {
      status.set(error instanceof Error ? error.message : String(error))
    }
  })

  inject(DestroyRef).onDestroy(() => {
    destroyed = true
    transaction()?.unmount().catch(() => {})
  })

  return { status: status.asReadonly(), transaction: transaction.asReadonly() }
}
