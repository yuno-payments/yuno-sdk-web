# HeadlessVTEXiOS

An example iOS app using SwiftUI that demonstrates **bi-directional communication** between native Swift and an embedded `WKWebView` loading an **external URL**.

### 📦 Features

- Accepts JSON input from user via a `TextEditor`
- Sends JSON to a webpage loaded in `WKWebView` using `window.postMessage`
- Listens for messages from JavaScript using `WKScriptMessageHandler`
- Resets the view automatically when JS responds

---

### 🚀 How to Run

1. Open the project in **Xcode**.
2. Make sure you have selected an iOS **simulator or device**.
3. Build and run the app.
4. Type or paste a JSON string and press **Send to WebView**.
5. The WebView loads your target URL.
6. JS can receive data using:
  ```js
    window.addEventListener("message", (event) => {
        console.log("📩 Received JSON:", event.data);
        // You can trigger a response back to Swift:
        window.webkit.messageHandlers.iosListener.postMessage("done");
    });
  ```
7. JS can respond using:
   ```js
   window.webkit.messageHandlers.iosListener.postMessage("back");

### How It Works
ContentView holds two states: the JSON input and a flag (jsonToSend) that switches between views. 

When jsonToSend is set, it loads WebView and passes the JSON. 

Inside WebView.swift, Swift injects the JSON into the page using window.postMessage(...).

The JavaScript side can use window.webkit.messageHandlers.iosListener.postMessage(...) to trigger Swift logic.

On receiving the JS message, Swift clears jsonToSend, returning the user to the input screen.

### How to Adapt It
To use this in your own project:

Replace the external URL with your own (externalURL in WebView.swift)

Update the JSON format or message handling logic

Customize the window.postMessage(...) structure to match your JS logic

Modify userContentController(_:didReceive:) to handle custom JS messages

### File Structure
ContentView.swift – Main UI with JSON input and View toggling

WebView.swift – UIViewRepresentable wrapping WKWebView, message injection and listening