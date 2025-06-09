//
//  WebView.swift
//  HeadlessVTEXiOS
//
//  Created by Camilo Segura on 2025-06-06.
//

import SwiftUI
import WebKit

// SwiftUI wrapper for WKWebView
struct WebView: UIViewRepresentable {
    @Binding var stringToSend: String?     // Bind to the parent's stringToSend state
    let externalURL: String              // URL to be loaded in the WebView

    // Coordinator handles WebView delegate callbacks and JS message handling
    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: WebView

        init(_ parent: WebView) {
            self.parent = parent
        }

        // Called when JS sends a message using window.webkit.messageHandlers.iosListener.postMessage(...)
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            print("📬 Message from JS: \(message.body)")
            parent.stringToSend = nil // Reset the state to show the input again
        }

        // Called when WebView finishes loading
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Ensure valid string payload is available
            guard let message = parent.stringToSend else {
                            print("❌ No message to send")
                            return
                        }

            // Inject the JSON string using postMessage
            let js = "window.postMessage(\(message), '*');"

            // Execute the JS in the context of the loaded webpage
            webView.evaluateJavaScript(js) { _, error in
                if let error = error {
                    print("⚠️ JavaScript Error: \(error)")
                } else {
                    print("✅ JSON sent to WebView")
                }
            }
        }
    }

    // Create the coordinator
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    // Create the WebView with config
    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "iosListener") // Add JS handler

        let config = WKWebViewConfiguration()
        config.userContentController = contentController

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator

        // Load the provided URL
        if let url = URL(string: externalURL) {
            webView.load(URLRequest(url: url))
        }

        return webView
    }
    
    // No need to update the view after it's created
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
