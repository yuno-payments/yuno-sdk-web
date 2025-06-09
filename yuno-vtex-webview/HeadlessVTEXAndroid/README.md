# HeadlessVTEXAndroid

An example Android app using Kotlin and Jetpack Compose that demonstrates **bi-directional communication** between native Kotlin and an embedded `WebView` loading an **external URL**.

---

### 📦 Features

- Accepts JSON input from the user via a `TextField`
- Sends JSON to a webpage loaded in `WebView` using `window.postMessage`
- Listens for messages from JavaScript using `@JavascriptInterface`
- Resets the view automatically when JS responds

---

### 🚀 How to Run

1. Open the project in **Android Studio**.
2. Make sure you have selected an Android **emulator or device**.
3. Build and run the app.
4. Paste a JSON string and press **Send to WebView**.
5. The WebView loads your target URL.
6. JS can receive data using:
   ```js
   window.addEventListener("message", (event) => {
       console.log("📩 Received JSON:", event.data);
       // You can trigger a response back to Android:
       window.Android.receiveMessageFromJS("done");
   });
