// Calls to the merchant server in ../../../server, proxied by `ng serve` under /api. Same six calls in every client.
// ?country=BR&language=pt in the URL override the server defaults for one page load.
import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'

export interface Config { publicApiKey: string; country: string; language: string }

@Injectable({ providedIn: 'root' })
export class MerchantApi {
  private readonly http = inject(HttpClient)
  private readonly query = new URLSearchParams(location.search)

  private post<T>(route: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(route, body))
  }

  async config(): Promise<Config> {
    const { publicApiKey, country } = await firstValueFrom(this.http.get<{ publicApiKey: string; country: string }>('/api/config'))
    return { publicApiKey, country: this.query.get('country') ?? country, language: this.query.get('language') ?? 'en' }
  }
  createCustomer(body: { country: string }) { return this.post<{ id: string }>('/api/customers', body) }
  createCheckoutSession(body: { customerId: string; country: string; workflow?: string }) {
    return this.post<{ checkout_session: string }>('/api/checkout-sessions', body)
  }
  createPayment(body: { oneTimeToken: string; checkoutSession: string; customerId: string; country: string; type?: string }) {
    return this.post<unknown>('/api/payments', body)
  }
  createCustomerSession(body: { customerId: string; country: string }) {
    return this.post<{ customer_session: string }>('/api/customer-sessions', body)
  }
  enrollPaymentMethod({ customerSession, ...body }: { customerSession: string; country: string; type: string }) {
    return this.post<unknown>(`/api/customer-sessions/${customerSession}/payment-methods`, body)
  }
}
