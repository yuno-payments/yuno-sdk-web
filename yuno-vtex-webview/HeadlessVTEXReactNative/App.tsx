/**
 * App de ejemplo (PoC) que abre un WebView apuntando a la página de sdk-web-demo
 * donde se monta el SDK Headless de VTEX para procesar Google Pay.
 *
 * Flujo:
 *  1. Pantalla con botón "Pagar con VTEX".
 *  2. Al presionarlo se abre el WebView (URL de staging).
 *  3. El SDK procesa el pago y la página web nos envía el resultado vía
 *     window.ReactNativeWebView.postMessage(JSON.stringify(...)).
 *  4. Recibimos el mensaje en onMessage, cerramos el WebView y mostramos el resultado.
 *
 * Contrato de mensajes (definido en sdk-web-demo/src/app/vtex-webview/page.tsx):
 *   { type: 'paymentDone', paymentData: { success, payments } }
 *   { type: 'error', message, error }
 *   { type: 'loading', loading }   <- informativo, se ignora aquí
 */
import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { WEBVIEW_URL } from './config'

type PaymentResult =
  | { type: 'paymentDone'; paymentData: { success?: boolean; payments?: unknown[] } }
  | { type: 'error'; message: string; error?: unknown }

export default function App() {
  const [showWebView, setShowWebView] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const webRef = useRef<WebView>(null)

  function startPayment() {
    setResult(null)
    setShowWebView(true)
  }

  function handleMessage(event: WebViewMessageEvent) {
    let data: any
    try {
      data = JSON.parse(event.nativeEvent.data)
    } catch {
      // Mensajes no-JSON (logs sueltos): los ignoramos.
      return
    }

    if (data?.type === 'loading') {
      setLoading(Boolean(data.loading))
      return
    }

    if (data?.type === 'paymentDone' || data?.type === 'error') {
      // Cerrar el WebView y mostrar el resultado.
      setShowWebView(false)
      setLoading(false)
      setResult(data as PaymentResult)

      const title = data.type === 'paymentDone' ? 'Pago finalizado' : 'Error en el pago'
      const body =
        data.type === 'paymentDone'
          ? `success: ${data.paymentData?.success}\n${JSON.stringify(data.paymentData?.payments ?? [], null, 2)}`
          : String(data.message ?? 'Error desconocido')
      Alert.alert(title, body)
    }
  }

  // ----- WebView a pantalla completa -----
  if (showWebView) {
    return (
      <SafeAreaView style={styles.flex}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.webHeader}>
          <Text style={styles.webHeaderTitle}>Pago VTEX</Text>
          <TouchableOpacity onPress={() => setShowWebView(false)}>
            <Text style={styles.closeBtn}>Cerrar ✕</Text>
          </TouchableOpacity>
        </View>
        <WebView
          ref={webRef}
          source={{ uri: WEBVIEW_URL }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleMessage}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
        {loading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Procesando pago…</Text>
          </View>
        )}
      </SafeAreaView>
    )
  }

  // ----- Pantalla inicial -----
  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.center}>
        <Text style={styles.title}>PoC VTEX Headless · Google Pay</Text>
        <Text style={styles.subtitle}>WebView → SDK Headless de VTEX (staging)</Text>

        <TouchableOpacity style={styles.payBtn} onPress={startPayment}>
          <Text style={styles.payBtnText}>Pagar con VTEX</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              {result.type === 'paymentDone' ? '✅ Resultado del pago' : '❌ Error'}
            </Text>
            <Text style={styles.resultText}>
              {result.type === 'paymentDone'
                ? `success: ${result.paymentData?.success}\n${JSON.stringify(
                    result.paymentData?.payments ?? [],
                    null,
                    2,
                  )}`
                : result.message}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 8, marginBottom: 32, textAlign: 'center' },
  payBtn: {
    backgroundColor: '#5433FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    width: '100%',
  },
  resultTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  resultText: { fontSize: 13, color: '#334155', fontFamily: 'monospace' },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  webHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  closeBtn: { fontSize: 15, color: '#5433FF', fontWeight: '600' },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  loadingText: { color: '#64748b' },
})
