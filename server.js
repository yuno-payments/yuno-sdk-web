const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const v4 = require('uuid').v4

require('dotenv').config()

const YUNO_API_URL = 'https://api-dev.y.uno'

// Ask for these keys to sales department 
const X_ACCOUNT_CODE = process.env.YUNO_X_ACCOUNT_CODE
const PUBLIC_API_KEY = process.env.YUNO_PUBLIC_API_KEY
const PRIVATE_SECRET_KEY = process.env.YUNO_PRIVATE_SECRET_KEY

const SERVER_PORT = process.env.PORT

const staticDirectory = path.join(__dirname, 'static')

const indexPage = path.join(__dirname, 'index.html')
const checkoutPage = path.join(__dirname, 'checkout.html')
const checkoutLitePage = path.join(__dirname, 'checkout-lite.html')
const statusPage = path.join(__dirname, 'status.html')

const app = express()

app.use(express.json())
app.use('/static', express.static(staticDirectory))

app.get('/', (req, res) => {
  res.sendFile(indexPage) 
})

app.get('/checkout', (req, res) => {
  res.sendFile(checkoutPage) 
})

app.get('/checkout-lite', (req, res) => {
  res.sendFile(checkoutLitePage) 
})

app.get('/status', (req, res) => {
  res.sendFile(statusPage) 
})

app.post('/checkout/sessions', async (req, res) => {
  const response = await fetch(`${YUNO_API_URL}/public-api/v1/checkout/sessions`, {
    method: 'POST',
    headers: {
      'x-account-code': X_ACCOUNT_CODE,
      'public-api-key': PUBLIC_API_KEY,
      'private-secret-key': PRIVATE_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant_order_id: '00001000',
      payment_description: 'Test Wompi 09052022-21',
      country: 'CO',
      customer_id: '78f22117-b442-4a94-952e-3f2bfa7ca7bc',
      amount: {
          currency: 'COP',
          value: 949
      }
    })
  }).then(resp => resp.json())

  res.send(response)
})

app.post('/payments', async (req, res) => {
  const checkoutSession = req.body.checkoutSession
  const oneTimeToken = req.body.oneTimeToken

  const response = await fetch(`${YUNO_API_URL}/public-api/v1/payments`, {
    method: 'POST',
    headers: {
      'x-account-code': X_ACCOUNT_CODE,
      'public-api-key': PUBLIC_API_KEY,
      'private-secret-key': PRIVATE_SECRET_KEY,
      'x-idempotency-key': v4(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Test SPINPAY 09052022-21',
      merchant_order_id: '0000022',
      country: 'CO',
      additional_data: {
          airline: {
              legs: [
                  {
                      arrival_airport: 'AMS',
                      base_fare: 200,
                      base_fare_currency: 'BRL',
                      carrier_code: 'KL',
                      departure_airport: 'EZE',
                      departure_airport_timezone: '-03:00',
                      departure_datetime: '2014-05-12 13:05:00',
                      fare_basis_code: 'HL7LNR',
                      fare_class_code: 'FR',
                      flight_number: '842',
                      stopover_code: 's'
                  }
              ],
              passengers: [
                  {
                      country: 'st',
                      date_of_birth: 'stringstri',
                      document: {
                          document_number: '1042565431',
                          document_type: 'CC'
                      },
                      first_name: 'string',
                      last_name: 'string',
                      loyalty_number: 'string',
                      loyalty_tier: 'strin',
                      middle_name: 'string',
                      nationality: 'st',
                      type: 's'
                  }
              ],
              pnr: '1P-2UUGJW',
              ticket: {
                  ticket_number: '123456',
                  restricted: false,
                  total_fare_amount: 80.00,
                  total_tax_amount: 22.00,
                  total_fee_amount: 14.00,
                  issue: null,
                  e_ticket: false
              }
          },
          order: {
              fee_amount: 40.5,
              items: [
                  {
                      brand: 'XYZ',
                      category: 'Clothes',
                      id: '123AD',
                      manufacture_part_number: 'XYZ123456',
                      name: 'Skirt',
                      quantity: 3,
                      sku_code: '8765432109',
                      unit_amount: 20
                  }
              ],
              shipping_amount: 10.35
          }
      },
      amount: {
          currency: 'COP',
          value: 68376
      },
      checkout: {
          session: checkoutSession
      },
      customer_payer: {
          billing_address: {
              address_line_1: 'Calle 1 # 1 - 1',
              address_line_2: 'Apartamento 1, Torre I',
              city: 'Bogota',
              country: 'CO',
              state: 'Cundinamarca',
              zip_code: '111111'
          },
          browser_info: {
              accept_header: 'string',
              color_depth: 'string',
              javascript_enabled: 'string',
              language: 'string',
              screen_height: 'string',
              screen_width: 'string',
              user_agent: 'string'
          },
          date_of_birth: '1990-02-28',
          device_fingerprint: 'hi88287gbd8d7d782ge....',
          document: {
              document_type: 'CC',
              document_number: '1042565431'
          },
          email: 'pepitoperez@y.uno',
          first_name: 'Pepito',
          gender: 'MALE',
          id: '78f22117-b442-4a94-952e-3f2bfa7ca7bc',
          ip_address: '192.168.123.167',
          last_name: 'Perez',
          merchant_customer_id: 'example00234',
          nationality: 'CO',
          phone: {
              country_code: '57',
              number: '3001111111'
          },
          shipping_address: {
            address_line_1: 'Calle 1 # 1 - 1',
            address_line_2: 'Apartamento 1, Torre I',
            city: 'Bogota',
            country: 'CO',
            state: 'Cundinamarca',
            zip_code: '111111'
          }
      },
      payment_method: {
          token: oneTimeToken
      }
    })
  }).then(resp => resp.json())

  res.json(response)
})

app.listen(SERVER_PORT, () => {
  console.log(`server started at port: ${SERVER_PORT}`)
})