// Merchant server for the v2 examples. Plain Express, no build step.
//
// It does the three things a merchant backend must do and nothing else:
//   1. keep the private key off the browser,
//   2. create customers, checkout sessions and customer sessions,
//   3. create the payment when the SDK hands the browser a one-time token (manual mode).
//
// Every client (vanilla, React, Angular) calls the same /api routes.

import express from 'express'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const here = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(here, '..', '.env') })
dotenv.config({ path: path.join(here, '..', '..', '.env') }) // fall back to the repo root .env

const { ACCOUNT_CODE, PUBLIC_API_KEY, PRIVATE_SECRET_KEY, COUNTRY = 'CO', PORT = 8090 } = process.env

if (!ACCOUNT_CODE || !PUBLIC_API_KEY || !PRIVATE_SECRET_KEY) {
  console.error('Missing credentials. Copy v2/.env.example to v2/.env and fill it in.')
  process.exit(1)
}

// The key prefix says which environment it belongs to: sandbox_… → api-sandbox.y.uno
const ENV_SUFFIX = { dev: '-dev', staging: '-staging', sandbox: '-sandbox', prod: '' }
const API_URL = `https://api${ENV_SUFFIX[PUBLIC_API_KEY.split('_')[0]] ?? '-sandbox'}.y.uno/v1`

const CURRENCY = { CO: 'COP', BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', PE: 'PEN', US: 'USD', EC: 'USD' }
const AMOUNT = { COP: 20000, BRL: 20, MXN: 200, ARS: 2000, CLP: 5000, PEN: 20, USD: 20 }
const DOCUMENT = { CO: ['CC', '1032765432'], BR: ['CPF', '52998224725'], PE: ['DNI', '12345678'], AR: ['DNI', '35123456'], CL: ['CI', '80209924'], MX: ['CURP', 'HEGA930623HDFRRR09'] }

async function yuno(method, route, body) {
  const response = await fetch(`${API_URL}${route}`, {
    method,
    headers: {
      'public-api-key': PUBLIC_API_KEY,
      'private-secret-key': PRIVATE_SECRET_KEY,
      'X-idempotency-key': randomUUID(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  console.log(`${method} ${route} → ${response.status}`, data.code ? data : '')
  if (!response.ok) throw Object.assign(new Error(`Yuno ${route} failed`), { status: response.status, data })
  return data
}

const amountFor = (country) => {
  const currency = CURRENCY[country] ?? 'USD'
  return { currency, value: AMOUNT[currency] ?? 20 }
}

const app = express()
app.use(express.json())

// What the browser needs to start: the public key and the default country.
app.get('/api/config', (req, res) => {
  res.json({ publicApiKey: PUBLIC_API_KEY, country: COUNTRY })
})

// A customer per page load keeps saved cards and enrollments from piling up on one profile.
app.post('/api/customers', async (req, res, next) => {
  try {
    const country = req.body.country ?? COUNTRY
    const [documentType, documentNumber] = DOCUMENT[country] ?? ['PASS', 'T12345']
    const merchantCustomerId = `v2-example-${Date.now()}`
    const customer = await yuno('POST', '/customers', {
      merchant_customer_id: merchantCustomerId,
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: `ada+${Date.now()}@example.com`,
      country,
      document: { document_type: documentType, document_number: documentNumber },
      phone: { country_code: '57', number: '3131231232' },
    })
    res.json({ id: customer.id, merchantCustomerId })
  } catch (error) { next(error) }
})

// Payment: the checkout session the SDK renders. workflow=SDK_SEAMLESS lets Yuno create the payment (managed mode).
app.post('/api/checkout-sessions', async (req, res, next) => {
  try {
    const { customerId, country = COUNTRY, workflow } = req.body
    const session = await yuno('POST', '/checkout/sessions', {
      account_id: ACCOUNT_CODE,
      merchant_order_id: `v2-example-${Date.now()}`,
      payment_description: 'Universal SDK example',
      country,
      customer_id: customerId,
      amount: amountFor(country),
      ...(workflow ? { workflow } : {}),
    })
    res.json(session)
  } catch (error) { next(error) }
})

// Manual mode: the SDK gives the browser a one-time token, the browser gives it to us, we create the payment.
app.post('/api/payments', async (req, res, next) => {
  try {
    const { oneTimeToken, checkoutSession, customerId, country = COUNTRY, type = 'CARD' } = req.body
    const payment = await yuno('POST', '/payments', {
      account_id: ACCOUNT_CODE,
      merchant_order_id: `v2-example-${Date.now()}`,
      description: 'Universal SDK example',
      country,
      amount: amountFor(country),
      checkout: { session: checkoutSession },
      customer_payer: { id: customerId },
      payment_method: { type, token: oneTimeToken, vault_on_success: type === 'CARD' },
    })
    res.json(payment)
  } catch (error) { next(error) }
})

// Enrollment: a customer session plus the payment method type the shopper will save.
app.post('/api/customer-sessions', async (req, res, next) => {
  try {
    const { customerId, country = COUNTRY } = req.body
    res.json(await yuno('POST', '/customers/sessions', { account_id: ACCOUNT_CODE, country, customer_id: customerId }))
  } catch (error) { next(error) }
})

app.post('/api/customer-sessions/:customerSession/payment-methods', async (req, res, next) => {
  try {
    const { country = COUNTRY, type = 'CARD' } = req.body
    res.json(await yuno('POST', `/customers/sessions/${encodeURIComponent(req.params.customerSession)}/payment-methods`, {
      account_id: ACCOUNT_CODE,
      country,
      payment_method_type: type,
    }))
  } catch (error) { next(error) }
})

app.use(express.static(path.join(here, '..', 'clients', 'vanilla')))

app.use((error, req, res, next) => {
  res.status(error.status ?? 500).json({ error: error.message, details: error.data ?? null })
})

app.listen(PORT, () => {
  console.log(`v2 examples: http://localhost:${PORT}  (Yuno API: ${API_URL})`)
})
