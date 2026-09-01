/**
 * Configuración del WebView para la PoC.
 *
 * La app construye la URL al hacer click (ver buildWebViewUrl), pasando el payload
 * del SDK Headless de VTEX por el query param `payload` (urlencoded). Así se cambia
 * el caso de prueba editando `payload.ts`, sin redesplegar la página web.
 *
 * Hay dos métodos: 'google' (Google Pay) y 'apple' (Apple Pay), cada uno con su payload.
 *
 * Los payloads viven en ./payload.ts
 */
import { applePayPayload, googlePayPayload } from './payload'

/** Método de wallet a probar. */
export type WalletMethod = 'google' | 'apple'

/** URL base de la página (sdk-web-demo) desplegada en staging. */
export const BASE_URL = 'https://demo.staging.y.uno/vtex-webview'

/** Idioma de la UI del SDK ('pt' | 'es' | 'en'). null/'' para no enviarlo (usa el default de la página). */
export const LANGUAGE: string | null = 'pt'

/**
 * Construye la URL del WebView con el payload (y opcionalmente el idioma) como query params.
 * Usa encodeURIComponent (vía URLSearchParams) porque el payload contiene caracteres como
 * '+' que deben escaparse.
 */
export function buildWebViewUrl(method: WalletMethod): string {
  const payload = method === 'apple' ? applePayPayload : googlePayPayload
  const params = new URLSearchParams()
  params.set('payload', JSON.stringify(payload))
  if (LANGUAGE) {
    params.set('language', LANGUAGE)
  }
  return `${BASE_URL}?${params.toString()}`
}
