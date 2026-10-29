// Creates one SDK transaction per mounted component and tears it down on unmount.
//
// transaction.start() is single-shot and React StrictMode runs effects twice in development,
// so the setup runs once per component instance (ref-guarded) and cleanup unmounts whatever exists.
import { useEffect, useRef, useState } from 'react'
import type { SdkPaymentsStatic, TransactionStatus } from '../../../../types/sdk-payments'
import { api } from '../lib/api'
import { loadSdk, formatStatus } from '../lib/sdk'

export interface SetupContext {
  SdkPayments: SdkPaymentsStatic
  publicApiKey: string
  country: string
  language: string
  /** Pass as the config's onStatus: logs the result and shows it in the status line. */
  onStatus: (result: TransactionStatus) => void
}

interface Unmountable { unmount(): Promise<void> }

export function useTransaction<T extends Unmountable>(setup: (ctx: SetupContext) => Promise<T>) {
  const [status, setStatus] = useState('')
  const [transaction, setTransaction] = useState<T>()
  const started = useRef(false)
  const live = useRef<T>(undefined)

  useEffect(() => {
    if (!started.current) {
      started.current = true
      ;(async () => {
        const [{ publicApiKey, country, language }, SdkPayments] = await Promise.all([api.config(), loadSdk()])
        const created = await setup({ SdkPayments, publicApiKey, country, language, onStatus: (r) => setStatus(formatStatus(r)) })
        live.current = created
        setTransaction(created)
      })().catch((error) => setStatus(error instanceof Error ? error.message : String(error)))
    }
    return () => {
      live.current?.unmount().catch(() => {})
      live.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { status, transaction }
}
