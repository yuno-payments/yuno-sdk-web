//
//  ContentView.swift
//  HeadlessVTEXiOS
//
//  Created by Camilo Segura on 2025-06-05.
//

import SwiftUI

struct ContentView: View {
    // State for storing the string payload input string
    @State private var stringInput: String = "{\"isVTEXCard\":true,\"checkoutSessions\":[\"acd5c64e-f4c6-4cde-a24d-840e2d7ed78c\"],\"paymentIds\":[\"6BB2F575BB1B493A9D3A3EBD8D8AA8D8\"],\"orderId\":\"1510060504991\",\"publicApiKeys\":[\"sandbox_gAAAAABmq_lv7XP4nR-1Wey4rNuph3vWrCxxDwXYB9_V28t2ZGiAJPBAiWRKUxCu1siekHoTkSTNWaUoi2kjfyVJHdPbqZ3mrKwwXHtwkEeOBYqiAGmGQ2-RXJT3-ay-XUrnRbAWwz_tnwU-CHrb1_Mh6GkBzWCvMaZqeGwjF3xVRCeGfrlZopW9mmB7G93d-Q7UBTIcQNIQi-llGl8VHR396GKiwZT8XGC0wYh5ZYzotUWs9KZ1PZkH1d-ow-Zw2tmsv8cuc3HJ\"],\"country_code\":\"BR\",\"paymentMethod\":\"Visa\",\"authorizations\":[{\"reference\":\"504991\",\"orderId\":\"1510060504991\",\"shopperInteraction\":\"ecommerce\",\"paymentMethod\":\"Visa\",\"value\":0,\"referenceValue\":148,\"currency\":\"BRL\",\"installments\":1,\"installmentsInterestRate\":0,\"installmentsValue\":148,\"ipAddress\":\"185.239.149.42\",\"miniCart\":{\"buyer\":{\"email\":\"camilo.segura@y.uno\",\"firstName\":\"Camilo\",\"lastName\":\"Segura\",\"document\":\"02678175928\",\"phone\":\"+5511912345678\"},\"shippingAddress\":{\"receiverName\":\"Camilo Segura\",\"postalCode\":\"89220555\",\"city\":\"Joinville\",\"state\":\"SC\",\"country\":\"BRA\",\"street\":\"Rua São Matias\",\"number\":\"1\"},\"billingAddress\":{\"postalCode\":\"89220555\",\"street\":\"Rua São Matias\",\"neighborhood\":\"Costa e Silva\",\"city\":\"Joinville\",\"state\":\"SC\",\"country\":\"BRA\",\"number\":\"1\"},\"items\":[{\"id\":\"17\",\"name\":\"BLACK + DECKER 20V Max Cordless Motosserra, 10 polegadas, ferramenta somente (LCS1020B)\",\"price\":138,\"quantity\":1}],\"shippingValue\":10,\"taxValue\":0},\"paymentId\":\"6BB2F575BB1B493A9D3A3EBD8D8AA8D8\",\"transactionId\":\"A09E2F38DD524C64B92CD5019D9A41E7\",\"callbackUrl\":\"https://yunopartnerbr.vtexpayments.com.br/payment-provider/transactions/A09E2F38DD524C64B92CD5019D9A41E7/payments/6BB2F575BB1B493A9D3A3EBD8D8AA8D8/retry\"}],\"sessions\":[\"ZjgyMzRmZTZmMDVkMzBkNTg2YjY5NzZjNDA2YTY0NTJmNTE2NWJiYTIyZjI3NjU2ZjRiNjg0YzNhZGZkZGQ5NTVjMzFhYWNkNDU1NzFlNTU1ZmQ1MmQ0MWQyYzdlZDM4MDNmNTQ4OTZhN2FiMmYyNTJhYzI4YzZkYzkxNTlmNDAzMmYwNmIyY2E1ZmM1OWE2OWZhOTUyNDY3NjI3YTM0OTQ5NmEyYTQwNzgzMTVhYmU2YTkzNDBhMTc2ZmFjNzY0NWU0ZjU3ZjBmNDIzNDVjNDJjM2MyNjBlZGIwMmQ2ZjkyMzc4OGEzODEzMjE0N2NhN2M0MTM4Y2RkMDAwNjRkYjkwNmQxMjAzZTdiNGNjODJlMjEzZjczZDliZDg3NTMxYjQzZjQ0ZmFiNDJlMmQ4M2UwYTg2YjJhZWNmMmNmYTYzNDY4ZDExZGE2YjAyZTMyYTA2MmI3ZWJlMzIyNjRkYWFlM2JjMTczNThiYmEyNzZkMGUzMzIzMDFlYjk4NTA4NzJjNTIwZjIxOWI5OWY3YTE3ZWJhNWFiMGI0YzYzNWEwNTMwMmQ4YzlmMmVhZGJiOTBlNmY1YTZjMzk3ZTU4M2E4NGU3YzMzMDI2YTczNzdmM2Y5ZWQwOWE3MGFiZjlmMDk4NzkwY2U5YTQ3MTQ1ZTY1MzhjYjU0N2ZhNjY4MDY2NDIxMjA5MWM3MDdhYzc4MDYwMzg0YzA4ODg2NzM0YzRjNzMwNzAyMGNiNWQxOTVlZTAxOWZiZWJhOTg4MWJhMTY2ODY1NDFjOWExMTdlM2M2OGJmMmE5OGI4OTBjYTBkYWIxZjI2ZDc5NDdmYzc2NDE0YjBmODNlNWFkM2RlYTFkNzM1ZmQzMGMxNTlmNTY5YTZmZTYwNGMxMjViMzY0ZTNkN2JmYTk0NWFmN2I2Y2ZiNTRjN2Y3Y2EwMzJjZGY1NDM4MTlhNTIwMTQ4MzY2YzI1YmUyYTk1M2VlYjFhZGE2YmQ5MWYxYjUxZGIwYjE1MWJhYmZmZmFjODgzMDNjNmY4OTBiMWMxZWViMzUwMmQ3NGIwZTljNDZlY2ZlMTkyNTgwZjYwNDcxZjQ5ZWEzMTEyODQyMjE2NDYxYzI0MzM5NjQ3MjU3NGQ5NTE2MGJiMDBhMjQxYThlNmM1ZDEwZDQ3NzFlNDM4YjNhNzZhMzkzNTIyZDNkNmE1YWQyNGY3MTc5ZGJjOWM4OGEzNmVhNjgzYmZiMGQ2YThjNDY4M2ZiNDRkNGJmODVmNzIyYThhMmNhZjY0NzRlMmYxYzYzMTFjNWQ1N2RhOWM3NmFhNmU5ZjJmZmEwODUxMDZmNDA4ZjJlMjkyN2VkZjRiMjRiYzk0ZGMxZTJiMzlhMzk5YjE4ZTUzNjYwZjhmMDJmNTVlZWVhYzdhOWE0MjIyMjBjOWM0NzQ1YTliOWQ0MjYxZmE0YjliMDcxNjhhM2NmZjA2NDRjNWEyZTQ1NWU5YjViMjAyY2NmNDI5MmU4OWEwNjgyZjdkODZkYTc3ZWE4YzEzYjVhODI3YzhjMmI0MWNiNTc1MjMwZTQzZjUzZjhlMTdmOTVjOTkxNmE0MWIwNmMzZDZkNjc2YTgxOTk2ZjZlMGEwNGZiZTMyYTIxMzk3YTdjYjhmNTRjYjJhZTNlYmNkYmI3Njc4ZTdiOWVjZDU3ZTkxZWI4NGY2MWUzNjQ0N2I1YzY4ODhmODVlYmQzY2Q4YjExY2E2M2RkNmUzOTAyZjgyNTRkMjcxZGU0MzI1YzUxMmViMTBkYTM4YTk3ZTMwMzM1N2ZkZmVkNDlkYTQ0MzQ1NjczZTJlNTljZDdkMmFlZGNjMWVlYjM4NWE3NjMyYjZkZjIxZDQ3M2I0ZTdmMzNhNTI3MDg1Y2M0OWEyYzVhZTRiZmVhYjg2MDVhZTQzZWIwY2ExM2RkMzc1MWE1MzQyMDMwMzc4ODI0YTZiMDQ4MjA0NjYwMmZmNmQ2ZDIwYTk4NGI1NWQ5MGU3ODBmODM2MGI5NGU4ZjNhNjYwNDlkZDZkNjBmN2NkMzAyOTZjNDczYjQwNTcyMjkyNWZh\"],\"account\":\"yunopartnerbr\"}"

    // State for toggling between input and WebView (also used to send data)
    @State private var stringToSend: String? = nil

    var body: some View {
        VStack {
            // If there's no JSON to send, show the input form
            if stringToSend == nil {
                VStack(alignment: .leading) {
                    // Button to trigger WebView display
                    Button("Send to WebView") {
                        stringToSend = stringInput
                    }
                    .padding()
                }
                .padding()
            } else {
                // When jsonToSend is set, show the WebView
                ZStack(alignment: .topLeading) {
                    WebView(
                        // this is the value of paymentAppData.payload
                        stringToSend: $stringToSend, // Pass the binding to WebView
                        externalURL: "https://aquamarine-alpaca-ecabd7.netlify.app?language=pt"
                    )
                    .edgesIgnoringSafeArea(.all) // Fullscreen
                }
            }
        }
    }
}
