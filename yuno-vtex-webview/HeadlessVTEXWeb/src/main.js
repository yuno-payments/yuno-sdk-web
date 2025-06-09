// Import Yuno's VTEX integration loader
import { loadScript } from '@yuno-payments/sdk-web-vtex'

// Listen for messages sent to the window (e.g. from Android/iOS WebViews)
window.addEventListener("message", onMessage)

// Triggered when a message is received by the window
async function onMessage(event) {
  const language = getLanguage()

  // Ensure payload is a stringified JSON
  let payload = typeof event.data === 'object' ? JSON.stringify(event.data) : event.data

  // Load the Yuno VTEX script
  const yunoVTEX = await loadScript()

  try {
    // Mount the Yuno payment widget
    yunoVTEX.mount({  
      elementRoot: "root-container",      // DOM element to mount the widget in
      payload,                            // JSON string with payment config
      language,                           // Language code
      domainVTEX: 'https://yunopartnerbr.myvtex.com', // VTEX shop domain
      onPaymentDone,                      // Callback on success
      onError,                            // Callback on error
      onLoading,                          // Callback when loading state changes
    });
  } catch (error) {
    // If mounting fails, notify native layer
    const message = {
      type: 'error',
      message: error.message,
      error: error
    }

    if (window.Android && window.Android.receiveMessageFromJS) {
      console.log("Android_onError_try")
      window.Android.receiveMessageFromJS(JSON.stringify(message))
    } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosListener) {
      console.log("iOS_onError_try")
      window.webkit.messageHandlers.iosListener.postMessage(message)
    }
  }
}

// Callback when payment is completed successfully
function onPaymentDone(paymentData) {
  const message = {
    type: 'paymentDone',
    paymentData: paymentData
  }

  if (window.Android && window.Android.receiveMessageFromJS) {
    console.log("Android_onPaymentDone")
    window.Android.receiveMessageFromJS(JSON.stringify(message))
  } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosListener) {
    window.webkit.messageHandlers.iosListener.postMessage(message)
  }
}

// Callback for general errors during the payment flow
function onError(message, error) {
  const errorMessage = {
    type: 'error',
    message: message,
    error: error
  }

  if (window.Android && window.Android.receiveMessageFromJS) {
    console.log("Android_onError")
    window.Android.receiveMessageFromJS(JSON.stringify(errorMessage))
  } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosListener) {
    console.log("iOS_onError")
    window.webkit.messageHandlers.iosListener.postMessage(errorMessage)
  }
}

// Called whenever the payment UI enters or exits a loading state
function onLoading(loading) {
  dispatchLoaderEvent({ showLoader: loading })
}

// Dispatches a custom DOM event for loading indicators
function dispatchLoaderEvent({ showLoader }) {
  const customEvent = new CustomEvent('yuno-loader-message', { detail: showLoader })
  document.dispatchEvent(customEvent)
}

// Detects browser language and returns one of the supported languages
function getLanguage() {
  const START_INDEX = 0
  const END_INDEX = 2
  const languages = ['en', 'es', 'pt']

  const navigatorLanguage = window.navigator.language.substring(
    START_INDEX,
    END_INDEX
  )

  return languages.includes(navigatorLanguage)
    ? navigatorLanguage
    : 'pt' // Fallback to Portuguese
}
