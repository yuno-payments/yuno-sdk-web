# HeadlessVTEXWeb

This script enables a bi-directional communication bridge between a VTEX-powered payment page (using the Yuno SDK) and a native Android or iOS app embedding it via WebView.

---

### 📦 Features

- Loads and mounts Yuno's VTEX payment widget using `@yuno-payments/sdk-web-vtex`
- Listens for JSON messages from native WebViews (iOS/Android)
- Sends results and errors back to the native layer
- Detects browser language and configures Yuno SDK accordingly
- Emits a custom DOM event (`yuno-loader-message`) for loading state

---

### 🚀 How It Works

1. **App sends JSON via `window.postMessage()`**
2. The script listens for messages and passes the data to Yuno's SDK
3. When payment succeeds or fails, the script notifies:
   - Android via `window.Android.receiveMessageFromJS(...)`
   - iOS via `window.webkit.messageHandlers.iosListener.postMessage(...)`

---

### 🧪 JavaScript Entry Points

#### ✅ `onMessage(event)`

Main handler that:
- Converts the incoming data to a JSON string
- Loads the Yuno SDK
- Mounts the widget with appropriate callbacks

#### ✅ `onPaymentDone(paymentData)`

Called when the Yuno SDK signals a successful payment.

#### ✅ `onError(message, error)`

Called when an error occurs during the payment lifecycle.

#### ✅ `onLoading(loading)`

Dispatches a DOM `CustomEvent` to toggle any native/app loading indicators.

#### ✅ `getLanguage()`

Determines the user's language from the browser and limits it to: `pt`, `en`, or `es`.

---

### 📲 Native Integration

#### ✅ Android

```kotlin
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun receiveMessageFromJS(message: String) {
        Log.d("FromJS", message)
        // Handle result
    }
}, "Android")
```

#### ✅ iOS

```swift
webConfiguration.userContentController.add(self, name: "iosListener")

// In WKScriptMessageHandler:
func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    print("FromJS: \(message.body)")
    // Handle result
}
```
