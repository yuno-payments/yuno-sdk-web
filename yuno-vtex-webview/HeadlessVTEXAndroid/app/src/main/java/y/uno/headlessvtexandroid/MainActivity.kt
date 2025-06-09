package y.uno.headlessvtexandroid

// Android + Jetpack Compose imports
import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import y.uno.headlessvtexandroid.ui.theme.HeadlessVTEXAndroidTheme

// Main Activity for the app
class MainActivity : ComponentActivity() {
    // Suppresses a lint warning about enabling JS (which is often discouraged for security, but fine here)
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enables drawing behind system bars (modern Android immersive layout)
        enableEdgeToEdge()

        // Set the UI content using Jetpack Compose
        setContent {
            // Tracks whether to show the WebView or not
            var showWebView by remember { mutableStateOf(false) }

            // Apply app theme
            HeadlessVTEXAndroidTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // Basic screen layout
                    Box(modifier = Modifier.padding(innerPadding)) {
                        // Show button first
                        if (!showWebView) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Button to trigger showing the WebView
                                Button(onClick = { showWebView = true }) {
                                    Text("Send to WebView")
                                }
                            }
                        } else {
                            // Render a native Android WebView inside Compose
                            AndroidView(
                                factory = { context ->
                                    WebView(context).apply {
                                        // Enable JavaScript
                                        settings.javaScriptEnabled = true

                                        // Add a JavaScript -> Android bridge
                                        addJavascriptInterface(object {
                                            // This method can be called from JS: Android.receiveMessageFromJS("hello")
                                            @JavascriptInterface
                                            fun receiveMessageFromJS(message: String) {
                                                Log.d("WebViewBridge", "📩 Message from JS: $message")

                                                // Use post to go back to UI thread
                                                post {
                                                    showWebView = false // Hide WebView after receiving message
                                                }
                                            }
                                        }, "Android")

                                        // Capture JS console.log calls and log them in Logcat
                                        webChromeClient = object : WebChromeClient() {
                                            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                                                Log.d("JSConsole", "${consoleMessage.message()} — line ${consoleMessage.lineNumber()}")
                                                return true
                                            }
                                        }

                                        // Hook into page lifecycle events
                                        webViewClient = object : WebViewClient() {
                                            override fun onPageFinished(view: WebView?, url: String?) {
                                                // When page is fully loaded, inject the JSON data into it
                                                // This is from VTEX response paymentAppData.payload
                                                val jsonString = "{\"isVTEXCard\":true,\"checkoutSessions\":[\"6b708cd4-688a-4c96-9bd4-5f5d8bcb816f\"],\"paymentIds\":[\"51D8A80BE19C44F2A34377890B6E334D\"],\"orderId\":\"1537640505993\",\"publicApiKeys\":[\"sandbox_gAAAAABjim947ypMr2kZL1hQjroyRx0ztItPW71KwRAYAo5rA4CbpYFNjxoQ1V9HbcOV6I6HDC1yLI3g664XbSmS0hx0SMVH0QGDf1oHaP1VrsdRwpkvW4WMfDRoj9H8ZL5WNMDY4JaaIAq7uK4l8pleAQlXHHtOZyWWZNpOznAfkTWqW_mQft8=\"],\"countryCode\":\"PE\",\"paymentMethod\":\"American Express\",\"authorizations\":[{\"reference\":\"505993\",\"orderId\":\"1537640505993\",\"shopperInteraction\":\"ecommerce\",\"paymentMethod\":\"American Express\",\"value\":0,\"referenceValue\":1542,\"currency\":\"BRL\",\"installments\":1,\"installmentsInterestRate\":0,\"installmentsValue\":1542,\"ipAddress\":\"186.119.230.131\",\"miniCart\":{\"buyer\":{\"email\":\"camilo.segura+pe@y.uno\",\"firstName\":\"Camilo\",\"lastName\":\"Segura\",\"document\":\"02678175928\",\"phone\":\"+51955846805\",\"corporateName\":null,\"tradeName\":null,\"corporateDocument\":null,\"stateInscription\":null,\"postalCode\":\"150101\",\"address\":{\"receiverName\":\"Camilo Segura\",\"postalCode\":\"150101\",\"city\":\"Lima\",\"state\":\"LIMA\",\"country\":\"PER\",\"street\":\"1\",\"number\":\"1\",\"neighborhood\":\"Lima\",\"complement\":null,\"reference\":null},\"gender\":null,\"birthDate\":null,\"createdDate\":\"2024-09-12T14:44:06.0155905Z\",\"corporatePhone\":null,\"isCorporate\":false,\"documentType\":\"dni\",\"id\":\"b9147a13-69cb-4475-9c5c-f6914a463615\"},\"shippingAddress\":{\"receiverName\":\"Camilo Segura\",\"postalCode\":\"150101\",\"city\":\"Lima\",\"state\":\"LIMA\",\"country\":\"PER\",\"street\":\"1\",\"number\":\"1\",\"neighborhood\":\"Lima\",\"complement\":null,\"reference\":null},\"billingAddress\":{\"addressType\":\"residential\",\"addressId\":\"5195109561033\",\"postalCode\":\"150101\",\"street\":\"1\",\"neighborhood\":\"Lima\",\"city\":\"Lima\",\"state\":\"LIMA\",\"country\":\"PER\",\"number\":\"1\",\"complement\":null},\"items\":[{\"id\":\"17\",\"name\":\"BLACK + DECKER 20V Max Cordless Motosserra, 10 polegadas, ferramenta somente (LCS1020B)\",\"price\":138,\"quantity\":1,\"discount\":0,\"deliveryType\":\"Normal\",\"categoryId\":\"9287\",\"sellerId\":\"1\",\"taxValue\":0,\"taxRate\":0,\"brandName\":\"Brand\",\"productId\":\"12\",\"categoryName\":\"Power tools\"},{\"id\":\"19\",\"name\":\"Skechers Feminino - Go Golf Drive 4 Dogs At Play Tênis de golfe sem pontas 8\",\"price\":697,\"quantity\":1,\"discount\":0,\"deliveryType\":\"Normal\",\"categoryId\":\"9283\",\"sellerId\":\"1\",\"taxValue\":0,\"taxRate\":0,\"brandName\":\"Brand\",\"productId\":\"13\",\"categoryName\":\"Sporting\"},{\"id\":\"45\",\"name\":\"1998 JOHN DEERE 8400T\",\"price\":697,\"quantity\":1,\"discount\":0,\"deliveryType\":\"Normal\",\"categoryId\":\"9284\",\"sellerId\":\"1\",\"taxValue\":0,\"taxRate\":0,\"brandName\":\"Brand\",\"productId\":\"22\",\"categoryName\":\"Agribusiness\"}],\"shippingValue\":10,\"taxValue\":0},\"paymentId\":\"51D8A80BE19C44F2A34377890B6E334D\",\"transactionId\":\"D75CC68C2C5649A98D1C7697282B5004\",\"callbackUrl\":\"https://yunopartnerbr.vtexpayments.com.br/payment-provider/transactions/D75CC68C2C5649A98D1C7697282B5004/payments/51D8A80BE19C44F2A34377890B6E334D/retry\",\"totalCartValue\":1542}],\"sessions\":[\"YzNlODU4ZGY3ZTliMThhMTdlYTllNTU4MTQ3YjQ0ZGZiMmQyZTZjNjNlZGJhNTU2OGExNjg3N2U4ZWYwMjc3ODZhNTkxNzc1NWMwNTg5ZTg3NTJlZGNkYTExMjI4YzkzMDRhMDgzODFjNzI5NTc3N2U0MWJjMGY5YzhiMjllNTE4NWEwZDgwZTc4MDhjZTkxYzkyZDQ4Y2YwY2E2YzNlOTEzNWUxNTczYjkxMTU5YjhmZDY1NWY3OTA2NmI1M2Y3N2IzZjRkYmU3MzYxOTRiOTNkYmExODVjZjUwZWVjMWNkZjA4OTgwNzFiYWI1ZmFlODY4YThkMzMwMWRhMmIzNzg5OWViNjcyY2QxYzQ2ZDUzZDg2NTlmN2JmMjdmMmRmMmIzOTk2ZGY5NjljYTkyNjY3MDRjNjEwMGRmNjNmODhiMThjYTEyMDhjZTNlZTNmMmE3Zjg0Yzk3ZTQzZmViZmM3MmE4N2NlNTliMDEyNjU0NjkyYTUyZDQzMWE4YTA0NmJhMmUyNDRkZmE4YmM1YjM3YTIwODMzNDE1OWIyNTliMjFlMGU5ZGE5OTE3YTYyNDk5ODliYmI0MzJiNTBkM2I1OGU0NDdlZjk3MDZiY2Q2MmQ1OTgxOWZmMjgyNmQ5ZWRhNDRlMGI0YjdhOTdhOTg3MjVlMDI1OWU1NDk5NjhkZWI5YzM4MjZkZDA5ODMzOWQ0OWQ4NzY5MWI0Y2QwYjc0NjczNGVmNzI5MjBiOTFlMzhiNzdmODg3YWM2ZDU0OWQ5NDg1MWQ5MWQ1Y2U3OGQ1OGZjNGYyMmQyNzMwZTc1NzFlYjE3NDk2OTJhMDk2MzE4Zjc5NmM4Y2RjZmFhZjFkOTBiNDJlNjhjODQ3ZjkyMTZiNWQ3NDA4NzdlM2ZmYTMzYTgwNzU3M2ZjZTgyNWE0Y2MzNzY5MDg4NWY0OTU5ODc3NDFhMmU1MGZmNDNmZDI1YzRlZmQyNDIyNWVlMGYxN2JjYzlhZjUwYjU1MjQ5ZmM2ZjY1MWFhOTYxNzBmNzQyNGMzOTNkNDcxOTNmZDNmYzdjNWQ5ZDRhZTMyMTc3MDkwMjk4ZWEwOWE3M2ZjYjNjMDhmODU2YThlYzZmMWFhNjMxZTAyYTQyMGRkODFjYjI1MTUyNWVkYjU4ZjFkMWU4YzNlNGQwMjQ2MTBjYzFlY2VhM2NjNDg1NjkzNDJmMGVkOWI4YjdlODIzZWJlZTI0YTUxN2JjZTYxZGE4NmM3YzcwYzEzZjY0MzMxMTRjYzdlYWQyZTNhNjkzYmY1N2E1MTUwMWY1ZTY3ZTBjNjQ2NTMzYjhhYzdkMDlmZmVhOWU4N2QzNDQ2NmI0MWRmMzk3ZmIzZjA4NzRhYTI1YjQwODllM2JkYTExNGEwM2IwYWFjZWJlMTNhYTg1ZmIzZmZjNTMxOWNhZTk0MjlmMWNlZGNlZmY2Nzc4NTJlZTE1MGIxMjNmMTgxMDU1NGQzMjNhM2Y2ODczN2JiZjI2MTE4MGQ1ZjU5ZmJlMGZhOTNiNzU5MjU1MjAyODU4ZGY5MzllMWM5ZTc5MDBiMWJhMzZmNDZkMGNiZWNmYzU4YjFlOGEyNGRjZDBlZjIyMGY2NjFhM2YxMzc1MjI4ZGE5NjBkMWVlOGMyMjAzZmNmZWQ2ZTYyYjlhNmQ3MWNjNTFjMmExNmFiZWRhZWJkMDZmNDVmYWZkMTYwMWJlMDBmZTAzYWI0MjkxNGJlNGNlMTE1ZDVmOTNiYzNhMjYzYjQ0MA==\"],\"account\":\"yunopartnerbr\"}"
                                                // Very long JSON string payload (truncated here for brevity)

                                                // Call `window.postMessage` inside the web page to send the data
                                                evaluateJavascript("window.postMessage('$jsonString', '*');", null)
                                            }
                                        }

                                        // Load the external web app
                                        loadUrl("https://aquamarine-alpaca-ecabd7.netlify.app?language=pt")
                                    }
                                },
                                modifier = Modifier.fillMaxSize() // WebView fills screen
                            )
                        }
                    }
                }
            }
        }
    }
}
