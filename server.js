const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const v4 = require('uuid').v4
const { getCountryData } = require('./utils')
const open = require('open')

require('dotenv').config()

let API_URL

// Ask for these keys to sales department
const ACCOUNT_CODE = process.env.ACCOUNT_CODE
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY
const PRIVATE_SECRET_KEY = process.env.PRIVATE_SECRET_KEY

const SERVER_PORT = 8080

let CUSTOMER_ID

const staticDirectory = path.join(__dirname, 'static')

const indexPage = path.join(__dirname, 'index.html')
const checkoutPage = path.join(__dirname, 'checkout.html')
const checkoutLitePage = path.join(__dirname, 'checkout-lite.html')
const seamlessCheckoutLitePage = path.join(__dirname, 'checkout-seamless-lite.html')
const statusPage = path.join(__dirname, 'status.html')
const statusLitePage = path.join(__dirname, 'status-lite.html')
const enrollmentLitePage = path.join(__dirname, 'enrollment-lite.html')
const checkoutSecureFieldsPage = path.join(__dirname, 'checkout-secure-fields.html')
const fullFeatures = path.join(__dirname, 'full-features.html')
const paymentMethodsUnfolded = path.join(__dirname, 'payment-methods-unfolded.html')

const app = express()

app.use(express.json())
app.use('/static', express.static(staticDirectory))

app.get('/', (req, res) => {
  res.sendFile(indexPage)
})

app.get('/checkout', (req, res) => {
  res.sendFile(checkoutPage)
})

app.get('/checkout/lite', (req, res) => {
  res.sendFile(checkoutLitePage)
})

app.get('/checkout/seamless/lite', (req, res) => {
  res.sendFile(seamlessCheckoutLitePage)
})

app.get('/checkout/secure-fields', (req, res) => {
  res.sendFile(checkoutSecureFieldsPage)
})

app.get('/status', (req, res) => {
  res.sendFile(statusPage)
})

app.get('/status-lite', (req, res) => {
  res.sendFile(statusLitePage)
})

app.get('/enrollment-lite', (req, res) => {
  res.sendFile(enrollmentLitePage)
})

app.get('/full-features', (req, res) => {
  res.sendFile(fullFeatures)
})

app.get('/checkout/payment-methods-unfolded', async (req, res) => {
  res.sendFile(paymentMethodsUnfolded)
})

app.post('/checkout/sessions', async (req, res) => {
  const country = req.query.country || 'CO'
  const { currency } = getCountryData(country)

  const response = await fetch(
    `${API_URL}/v1/checkout/sessions`,
    {
      method: 'POST',
      headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: ACCOUNT_CODE,
        merchant_order_id: '1655401222',
        payment_description: 'Test MP 1654536326',
        country,
        customer_id: CUSTOMER_ID,
        amount: {
          currency,
          value: 2000,
        },
      }),
    }
  ).then((resp) => resp.json())

  res.send(response)
})

app.post('/checkout/seamless/sessions', async (req, res) => {
  const country = req.query.country || 'CO'
  const { currency } = getCountryData(country)

  const response = await fetch(
    `${API_URL}/v1/checkout/sessions`,
    {
      method: 'POST',
      headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: ACCOUNT_CODE,
        merchant_order_id: '1655401222',
        payment_description: 'Test MP 1654536326',
        country,
        customer_id: CUSTOMER_ID,
        amount: {
          currency,
          value: 2000,
        },
        workflow: 'SDK_SEAMLESS',
        additional_data: {
          order: {
            shipping_amount: 12,
            fee_amount: 111,
            tip_amount: '12',
            taxes: [
              {
                type: 'VAT',
                tax_base: 123,
                value: 1,
                percentage: 1
              }
            ],
            items: [
              {
                category: 'coupons',
                id: 'ASD',
                name: 'rter',
                quantity: 12312,
                unit_amount: 1,
                brand: 'ASDA',
                sku_code: '123123',
                manufacture_part_number: 'SADSADAS'
              }
            ]
          },
          airline: {
            pnr: 'SADSDASD',
            legs: [
              {
                departure_airport: 'ASD',
                departure_datetime: '2024-07-03T05:00:00',
                arrival_airport: 'AMS',
                departure_airport_timezone: '-03:00',
                arrival_datetime: '2024-08-03T05:00:00',
                carrier_code: 'KL',
                flight_number: '842',
                fare_basis_code: 'HL7LNR',
                fare_class_code: 'FR',
                base_fare: 200,
                base_fare_currency: 'BRL',
                stopover_code: 's'
              }
            ],
            passengers: [
              {
                document: {
                  document_number: '351.040.753-97',
                  document_type: 'CI',
                  country: 'BO'
                },
                phone: {
                  country_code: '57',
                  number: '3132450765'
                },
                first_name: 'John',
                last_name: 'Doe',
                middle_name: 'Theodore',
                type: 'A',
                date_of_birth: '05-01-1984',
                nationality: 'BR',
                loyalty_number: '123456',
                loyalty_tier: '1'
              }
            ],
            tickets: [
              {
                issue: {
                  carrier_prefix_code: 'ASDASD',
                  travel_agent_code: 'DSADAS',
                  travel_agent_name: 'ASDA',
                  address: 'DASDAS',
                  city: 'ASDASD',
                  country: 'BR'
                },
                ticket_number: '123456',
                e_ticket: false,
                restricted: false,
                total_fare_amount: 80,
                total_tax_amount: 22,
                total_fee_amount: 14
              }
            ]
          }
        },
        customer_payer: {
          merchant_customer_id: '1',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-02-28',
          email: 'johndoe@y.uno',
          nationality: 'BO',
          ip_address: '192.168.123.167',
          device_fingerprint: 'hi88287gbd8d7d782ge',
          browser_info: {
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
            accept_header: 'true',
            color_depth: '15',
            screen_height: '2048',
            screen_width: '1152',
            javascript_enabled: false,
            language: 'es'
          },
          document: {
            document_number: '351.040.753-97',
            document_type: 'CI'
          },
          billing_address: {
            address_line_1: 'Calle 34 # 56 - 78',
            address_line_2: 'Apartamento 502, Torre I',
            city: 'Bogota',
            country: 'AR',
            state: 'Cundinamarca',
            zip_code: '111111',
            neighborhood: 'Barrio 11'
          },
          shipping_address: {
            address_line_1: 'Calle 34 # 56 - 78',
            address_line_2: 'Apartamento 502, Torre I',
            city: 'Bogota',
            state: 'Cundinamarca',
            zip_code: '111111',
            neighborhood: 'Barrio 11',
            country: 'CO'
          },
          phone: {
            country_code: '57',
            number: '3132450765'
          }
        },
        payment_method: {
          detail: {
            card: {
              verify: false,
              capture: true
            },
            ticket: {
              benefit_type: 'PRIVATE'
            }
          },
          vaulted_token: null,
          type: 'CARD',
          vault_on_success: false
        },
        installments: {
          plan: [
            {
              installment: 1,
              rate: 1
            }
          ]
        },
        fraud_screening: {
          stand_alone: false
        },
        metadata: [
          {
            key: 'ID',
            value: 'SD00'
          }
        ]
      }),
    }
  ).then((resp) => resp.json())

  res.send(response)
})

app.post('/payments', async (req, res) => {
  const checkoutSession = req.body.checkoutSession
  const oneTimeToken = req.body.oneTimeToken
  const country = req.query.country || 'CO'
  const { currency, documentNumber, documentType, amount } = getCountryData(country)

  const response = await fetch(`${API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'public-api-key': PUBLIC_API_KEY,
      'private-secret-key': PRIVATE_SECRET_KEY,
      'X-idempotency-key': v4(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Test Addi',
      account_id: ACCOUNT_CODE,
      merchant_order_id: '0000022',
      country,
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
              stopover_code: 's',
            },
          ],
          passengers: [
            {
              country: 'st',
              date_of_birth: 'stringstri',
              document: {
                document_number: documentNumber,
                document_type: documentType,
              },
              first_name: 'string',
              last_name: 'string',
              loyalty_number: 'string',
              loyalty_tier: 'strin',
              middle_name: 'string',
              nationality: 'st',
              type: 's',
            },
          ],
          pnr: '1P-2UUGJW',
          ticket: {
            ticket_number: '123456',
            restricted: false,
            total_fare_amount: 80.0,
            total_tax_amount: 22.0,
            total_fee_amount: 14.0,
            issue: null,
            e_ticket: false,
          },
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
              unit_amount: 20,
            },
          ],
          shipping_amount: 10.35,
        },
      },
      amount: {
        currency,
        value: amount,
      },
      checkout: {
        session: checkoutSession,
      },
      customer_payer: {
        billing_address: {
          address_line_1: 'Calle 34 # 56 - 78',
          address_line_2: 'Apartamento 502, Torre I',
          city: 'Bogota',
          country,
          state: 'Cundinamarca',
          zip_code: '111111',
        },
        date_of_birth: '1990-02-28',
        device_fingerprint: 'hi88287gbd8d7d782ge....',
        document: {
          document_type: documentType,
          document_number: documentNumber,
        },
        email: 'pepitoperez@y.uno',
        first_name: 'Pepito',
        gender: 'MALE',
        id: CUSTOMER_ID,
        ip_address: '192.168.123.167',
        last_name: 'Perez',
        merchant_customer_id: 'example00234',
        nationality: country,
        phone: {
          country_code: '57',
          number: '3132450765',
        },
        shipping_address: {
          address_line_1: 'Calle 34 # 56 - 78',
          address_line_2: 'Apartamento 502, Torre I',
          city: 'Bogota',
          country,
          state: 'Cundinamarca',
          zip_code: '111111',
        },
      },
      payment_method: {
        token: oneTimeToken,
        vaulted_token: null,
      },
    }),
  }).then((resp) => resp.json())

  res.json(response)
})

app.post('/customers/sessions', async (req, res) => {
  const country = req.query.country || 'CO'

  const response = await fetch(
    `${API_URL}/v1/customers/sessions`,
    {
      method: 'POST',
      headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "account_id": ACCOUNT_CODE,
        country,
        "customer_id": CUSTOMER_ID
      })
    }
  ).then((resp) => resp.json())

  res.send(response)
})

app.post('/customers/sessions/:customerSession/payment-methods', async (req, res) => {
  const customerSession = req.params.customerSession
  const paymentMethodType = req.query.paymentMethodType || 'NEQUI'
  const country = req.query.country || 'CO'

  const response = await fetch(
    `${API_URL}/v1/customers/sessions/${customerSession}/payment-methods`,
    {
      method: "POST",
      headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        "X-idempotency-key": v4(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "payment_method_type": paymentMethodType,
        country,
        "account_id": ACCOUNT_CODE
      }),
    }
  )

  res.send(response)
})

app.get('/payment-methods/:checkoutSession', async (req, res) => {
  const checkoutSession = req.params.checkoutSession
  const response = await fetch(
    `${API_URL}/v1/checkout/sessions/${checkoutSession}/payment-methods`,
    {
      method: 'GET',
      headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    }
  )
  const paymentMethods = await response.json()
  res.json(paymentMethods)
})


app.get('/sdk-web/healthy', (req, res) => {
  res.sendStatus(200)
})

app.get('/public-api-key', (req, res) => {
  res.json({ publicApiKey: PUBLIC_API_KEY })
})

app.listen(SERVER_PORT, async () => {
  console.log(`server started at port: ${SERVER_PORT}`)
  app._router.stack.forEach((middleware) => {
    if (middleware.route && middleware.route.methods.get) {
      console.log(`Ruta disponible: http://localhost:8080${middleware.route.path}`);
    }
  });

  API_URL = generateBaseUrlApi()

  CUSTOMER_ID = await createCustomer().then(({ id }) => id)

  await open(`http://localhost:${SERVER_PORT}`);
})

const ApiKeyPrefixToEnvironmentSuffix = {
  dev: '-dev',
  staging: '-staging',
  sandbox: '-sandbox',
  prod: '',
}

const baseAPIurl = 'https://api_ENVIRONMENT_.y.uno'

function generateBaseUrlApi() {
  const [apiKeyPrefix] = PUBLIC_API_KEY.split('_')
  let baseURL = ''
  const environmentSuffix = ApiKeyPrefixToEnvironmentSuffix[apiKeyPrefix]
  baseURL = baseAPIurl.replace('_ENVIRONMENT_', environmentSuffix)

  return baseURL
}

function createCustomer() {
  const response = fetch(
    `${API_URL}/v1/customers`,
    {
      method: 'POST',
      headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: 'CO',
        merchant_customer_id: Math.floor(Math.random() * 1000000).toString(),
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@y.uno"
      })
    }
  ).then((resp) => resp.json())

  return response
}