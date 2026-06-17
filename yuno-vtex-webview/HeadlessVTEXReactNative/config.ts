/**
 * URL que abrirá el WebView. Apunta a la página de `sdk-web-demo` desplegada en
 * staging, donde se monta el SDK Headless de VTEX.
 *
 * Para la PoC se prueba SIEMPRE contra staging (no local).
 *
 * La página /vtex-webview acepta la configuración por QUERY PARAMS:
 *   ?payload=<JSON urlencoded>   -> payload del SDK (string JSON)
 *   &language=<pt|es|en>         -> opcional
 *   &domainVTEX=<url>            -> opcional
 *
 * - Si abres la URL base (sin `payload`), la página usa el payload por defecto
 *   definido en sdk-web-demo/src/app/vtex-webview/payload.config.ts (cómodo para probar).
 * - Para cambiar los datos sin redesplegar, construye la URL con el param `payload`:
 *
 *     const json = JSON.stringify(miPayload)
 *     const url  = `https://demo.staging.y.uno/vtex-webview?payload=${encodeURIComponent(json)}`
 *
 *   ⚠️ Usa SIEMPRE encodeURIComponent (el payload contiene '+' y demás caracteres
 *      que deben ir escapados). El payload de ejemplo genera una URL de ~6.7 KB.
 */
export const WEBVIEW_URL = 'https://demo.staging.y.uno/vtex-webview'
