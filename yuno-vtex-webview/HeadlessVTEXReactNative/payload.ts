/**
 * Payloads del SDK Headless de VTEX que la app envía a la página /vtex-webview
 * por medio del query param `payload` (ver config.ts -> buildWebViewUrl).
 *
 * Se exportan DOS payloads: `googlePayPayload` y `applePayPayload`, derivados de
 * una misma base. Solo cambian los campos del método de pago:
 *   - `paymentType`:           'GOOGLE_PAY' | 'APPLE_PAY'
 *   - `paymentMethod` (raíz):  'Google Pay' | 'Apple Pay'
 *   - `authorizations[].paymentMethod`: 'Google Pay' | 'Apple Pay'
 *
 * Edita la base para cambiar el caso de prueba (monto, comprador, etc.) SIN tener
 * que tocar el repo de la página web.
 *
 * IMPORTANTE: `sessions`, `checkoutSessions`, `paymentIds` y `publicApiKeys` son
 * tokens de STAGING y EXPIRAN. Además, en un flujo real de Apple Pay estos tokens
 * deberían generarse para un pago de Apple Pay (aquí se reutilizan los del pago de
 * Google Pay solo para la prueba de viabilidad). Si el SDK reporta sesión inválida,
 * regenera el/los payload(s).
 */
const basePayload = {
  sessions: [
    'ZDkxMTI5YzdhYWQ3YTA4M2VkZmQ1MDJjMzkwMmI1NGZjNTRjYTRmZmZjYTdmMmZlOTZiNTMyNTM4N2Y0NDcyMTA2MzlmYTIyZDBlNmEwNWZhYTRmZTA3OGQwMGRjMjRiOTc5MzVmMDNhY2MwZDY4NzE4N2UyZjUwMTBmMGE5MzMzYjUyMjVkYWY1MDViZWY5MWYwOWI3N2E1M2RiZDc4ODE3YzU3MDhmMTcxMDBhODczOGYyNDYxYjllMDljMDQ0NmU4NWJmMTI3Zjg1ODA5OGM1NjM5OTg5NzU3OGFhNjIyZGY0ZDdjYWZjODdmMzE1NmE4Y2JmNGJlMDI4N2EyNzBlMzQ1OWU1MTE5M2VmYzE1ZTIwYmIzMjA3Zjc1NmE2YmExNzkwYjFiMTI4NDc2NjAzNGRmMTQxZmM0MTBiNTE1Y2RkYWM1YjBiNWE4YmRlY2ZkYjk4ZWRkOWI1NWVlMzQ2ZjUxMzQzNTVjOWJjMzljNTMzNDBlYmFlOTRlODJjYzZhNjgyNWFjM2UyN2Q1ZjFlOGYwYjBmNWM0MGE3NDBhNTk1ZmIzM2ExMDc1NDViMjYxYTUwMWQ2YmJlODU4ZTY3MDY4NjliZDA2ZTZjY2JlZjBkNGE3NWZkMGMxMTY0NDA4ZjZmZDJmYWI1YzJmYWZjZmJiODdmMjUxYzhlNDE4ZjRhOWVjYTRmOGZkYWI2ODVmZWZjODVjMjU1OGQ1NGQyNTk0ODA2Y2QzNWFkZjk1ZjE5YmU3ZGQ0OWJmMjIwYTkyMTNkZjU2MDZlMTlmZmUyZGFhN2M5ZTcyYTBjNWIyOGQ1YzNjNzI5MDQ3MmU2ZDE2ZDg1MzJiZGE3OWI2MzJkYzVmNWQwZTI2ZWZlYjljZjRkMjhkNjk3ZjQ5NGMyMzMyM2Q2ZmRlZTFjM2I3ZWVjYjVjMzFlNTBkOGY2OTYyOWQ3NjdhY2ZhMGU1YWYxMWUyZTQwY2Y3ZDdjMzM0NTE1NDcwOWU1NjE2ZGU3MWQ5NWJiYTZmMzQ1ZGMxNjgyYmFhMjdiYzU5YTIwNTY5NGJmYWNkOTM4NjMwZjdlYzBkNjY3YjU2M2Y0MmM2ZmU1YWE4ODEwMGRmYmJlM2I4YjA3MDFkNTlhODMyNjFmNGQwODU5OGRkODJmYTBlMTBkZmVkZTZjYzg4ZDM1MDc5ODFkNjMxMjcxNWE4YmI4YzMyYjlkNDQ5MmE1ZWViNDQ3MTY5OGRjZTgyMzI0NDU4ZTU3YjRmNjMyYWIxOTk3NzI1MWMzMWM0NGM0MzE1NDdmNTY4NzkyZDM2MmRlMTNiMzk1ZmQzN2IwZWVjMWRjZDk2ZTY4Y2Q5MzUyNzYxZDJhN2VjZGMyODQ4YzQwMzJhZWQxZjZkYTM4ZmE2NzkxOTdiZmI1ZTMyMzRhNzY0MGQ0ZDA5NGNkZDk4YzA1ZGQyZDUzMTc5MGY2ZjQ0ODJmNTE0MGZlOTZiYTg5ZGIzMTQwMjZjZGM2YWYyNjZjZmI2MTY0Zjc1YzQxNjY0ODE1MGJiMTgwMmY5NGViMjE1MmNhMTc2M2NiNzk5NjMwZTI0Yjg4NmQwOGYyNDMzOWMwNDcyYjJkZjg2ODM5OThjMjUyMzc0OTdiNTNkMjEwOWU4MWZkYzdmZmYyYTJhYzU4ZGQ4NmYxNGRhZGVlN2RlYzRjNGEzM2UyMDIwYzRhYWJjNTY3M2Q3YjAzYmE0NmZkNzBhMWE2NGEwMGMzZGZkNzljMTUyMzlkNDA1YWIyZWM3OWI0N2YwYzFiN2Y2MGM0NjQ2NTBjYTYzYWVjNmQ1YzRlNzhhOTYxODNkNWIyNTk5NzQwNTI5NWNmMDdkZGRmM2NiNzhhNDE3ZWMyZDkyNzYxMGQ5ZTI3Y2E2YmUzMWVlYzMyOThmOGY4NGVhYjk0ZTlmMDllMmU2ZDE4OWEwYjk3MzE0MjJlMmIwZTI1M2Y4MDE3MTBmYzk4OGI4ZjNhZGE3M2M4ODllNmE4N2Y3ZTk5N2MyNDAyMDhlNjhmNzQ2M2VhNDQxMGY0ZTc0NWNlZWRkNjg1NzllOTQwYzQ5NTQzN2JhM2FkMzAwY2Q0ODBhODdmOWY0OTI1ZDkyZTgwYmI3OTk4ZDc5MzUzN2ZmODY0NTAwZmI5MGNjNzVmNjMwYjA0Zjk5NjI0NjZiNWUxNDE5NDMxNjJmZDA0NWQzYzM3MDQ0YTY0YmRlY2RiMDkwNjhhZmEwM2FkMjlkNTczOGE0MjRjMWNjYTFhMzlhMTkyM2I0YTI4MTcyZTgxNDYzOWNjN2NmMmExNTc3NDNlMDE0NzkwMGFiMjQ1ZTNhMTI1ZGUxZjUxNTAxYWU0YzM1NWEyYTgzYzFlNjEzZDgwZDFlODg2MmEyZDg2MDE4Njc2MzhlNDFlZjMyMTYwYTc3YWEwN2M2ZmM1NDEzMmFlMGM2YzFmZWZmNzQ3MmQ3MGVhYjIzY2FhMjA1NmI3ZDM2MmM5ZWRiZGJjMjQ4YmY0N2E2ZDY2OTFhOGU2NDYzYTNhOWJmMmY5NTE2MTBlOTQyMDRmZWEwODM4NzJlYmUwNTlhOWU3NWU1MjM0NTc2NmM5OTM1NWU1OTUzMjlkMzY4ODEyNWYxMjVhYzExZDVlNTE1NzM1MGVkNzU5YjFiOTdkMzhhY2M1MzM3MjVkZmNmNzQ3Nzk4YTY5YWVjOTdmMzAzYWM1ZjEzNWNhNzBmZjM2YmRkMWQyNjY3Yjg2YWNkMDIwYTE2ZjQ3MDRjMDMzMmY4NDNiYjhlNDhiZjY0YTgzY2JjNzI0NmJhZjAwMzlkYmFhOTI0ZDUwMWYzNWFmMjViMzBmOGZjYjBhN2Y3OTI4NWNlMWE4ODdhZDMwMDI0ODJlMDMyMjFkNDBjZGQxOWU0NTI1OTNmMjM0YzI2NDA0ZWU1Y2U3OTllYjUwNmZjMjNiOTk5NzVhYzhkNjliYTE3Y2VlNDBhOTU0YWM0MjY3MGExMTBhZGRiNzVlMTRlYWMyOThhYjNiZTA3ZTUxNThlNDc3N2JlY2U5NzZkMjE0ZTVjZGVmYWVlYzlkNjRhM2Q0MTQ2NTdkOWMzOGQ3N2RkNGQwOWEyNjkwYjJjMTI1NTVmYzYzZTk0MDAxZTFmMTFlYjNiMWU1NTIzZDI0YTAzYmM4MzVmODBlYzY2ODE1ZGFlYjUzZWY4NDlkYWViNDExODFiOWU4YjI2NWUxNTBlZTA2NDUwMWRhMGUwNTk0MTEwN2FhZjIwYjI4ZGE3ODA1ZWNlNGQ0OWMzOGNjNzczZmVkMGUxYzllNjBjMDJjNTM4NzE1NDZmYzY5MjQ1ZmYwN2I3MWI3NTQ1MjI3YjI4MDAxZmU5ZGVhN2IzNTg2NmRhM2RhNjYzZDM2M2Y1ZWFkMDcyOTA3YjRhMTBjYmFhODcxNWVjMDhhOWNiZmEzNTk0MjAyN2Q1ZWY3NWZiZWM5Mjc2ZjMzNDQxMzlkODI3MTJjMmViOWM5NjRhNzM5NWY2OTVmZTJhNGIyNmFkYzExMjZiOWE1MWVjOTEyZjA3M2M1ZDkzMmIyYzExMTg4MGViNDg1NmE2MDRiMTQ5MTNiODU1OWRhZjUyYTFlNzM1MTg0NDkzZmM2ZTgyZThiNTkwMGQ3NDM4YTVjNGRhMjllY2YxNWQwYzExNDExMjBlNmE5MGRmN2Q0M2ZhZTM0OGQ5ZDU5NjQzODg5NzgxZWYwYTFjMTI2YjU4NmEwNDYzMjM1OTU3MzhhN2I2ZWZhYmZkYzJmNDM3YWM4MGU2NmUzZjIxZjBjZjI3ZWUyNDRmZjIyMWY3OWE4YzgyMGNlYjY0MTdiZDg3NjZlNjU4YTRiMzA0ZmFiZDRiOTEyMTAwMmYwNWQ5MTU0YjI0NWI4OGE3NjFjZTFkMDJjYTFiMTEyYzI4ODI0ZmU4NjcwMzZhODYzYzQzMTZlODVmYTcwMGUyY2E5NmFjZTExMDcwOWVlNjM0NjBjOTg2OWM0ODI4NTg3Y2VmNWQ4YTZlY2Ey',
  ],
  orderId: '1638599999999',
  paymentMethodCategory: 'WALLET',
  authorizations: [
    {
      totalCartValue: 707,
      orderId: '1638599999999',
      ipAddress: '186.98.89.7',
      installmentsInterestRate: 0,
      installmentsValue: 707,
      transactionId: '0E5F78E244F4483CBC0A86FDBCF76570',
      merchantName: 'yunopartnerbr',
      reference: '999999',
      installments: 1,
      paymentId: 'A68ED0C34A744D10AFA2966077C59A91',
      paymentMethod: 'Google Pay',
      shopperInteraction: 'ecommerce',
      callbackUrl:
        'https://yunopartnerbr.vtexpayments.com.br/payment-provider/transactions/0E5F78E244F4483CBC0A86FDBCF76570/payments/A68ED0C34A744D10AFA2966077C59A91/retry',
      currency: 'BRL',
      miniCart: {
        taxValue: 0,
        shippingAddress: {
          country: 'BRA',
          number: '123',
          city: 'São Paulo',
          receiverName: 'Hugo asdad',
          street: 'Rua Exemplo',
          postalCode: '01304001',
          neighborhood: 'Consolação',
          state: 'SP',
        },
        items: [
          {
            brandName: 'Brand',
            quantity: 1,
            productId: '13',
            deliveryType: 'Normal',
            discount: 0,
            categoryName: 'Sporting',
            taxRate: 0,
            sellerId: '1',
            taxValue: 0,
            price: 697,
            name: "Skechers Women's Go Golf Drive 4 Dogs At Play Spikeless Golf Shoes 8",
            id: '19',
            categoryId: '9283',
          },
        ],
        buyer: {
          firstName: 'Hugo',
          lastName: 'Test',
          address: {
            country: 'BRA',
            number: '123',
            city: 'São Paulo',
            receiverName: 'Hugo Test',
            street: 'Rua Exemplo',
            postalCode: '01304001',
            neighborhood: 'Consolação',
            state: 'SP',
          },
          documentType: 'cpf',
          phone: '+5511999999321',
          isCorporate: false,
          document: '12345678909',
          postalCode: '01304-001',
          stateInscription: '',
          id: 'c3a1fb80-6c10-4967-931c-4ab0f5de76fe',
          email: 'test@mail.com',
        },
        shippingValue: 10,
      },
      value: 0,
      referenceValue: 707,
    },
  ],
  hasGiftCards: false,
  checkoutSessions: ['6b495b32-7069-46e5-b45c-b40924168898'],
  paymentType: 'GOOGLE_PAY',
  paymentIds: ['A68ED0C34A744D10AFA2966077C59A91'],
  publicApiKeys: [
    'staging_gAAAAABpi6mQ0kfCygDwJ0CdBi0ZUPECfbIRGjoGD84H2PTDsmpYliRVd9QL8cDwjVfZXlcYjsArdGUzQTcPLKKIJWmanLCrB2oOqPxx3jozqqM7SKEv0bzFHUA2AkV0M9SfSfSStZAZbUUrWb7Rrn3tQOTgUeNjah-IGyOq_ccijC2MQmX3ZYcma4Fm3fcxYfoEN9dhV4-G5NFV72TDFv4SadFkJZrvp6FE8dM5E1pI0g9eDA794kdLxtvTo_Dog6tI6QWsTQFd',
  ],
  countryCode: 'BR',
  action: 'external-button',
  paymentMethod: 'Google Pay',
  account: 'yunopartnerbr',
}

/** Payload para Google Pay (la base ya está configurada para Google Pay). */
export const googlePayPayload = basePayload

/** Payload para Apple Pay: igual que la base, cambiando solo los campos del método. */
export const applePayPayload = {
  ...basePayload,
  paymentType: 'APPLE_PAY',
  paymentMethod: 'Apple Pay',
  authorizations: basePayload.authorizations.map((auth) => ({
    ...auth,
    paymentMethod: 'Apple Pay',
  })),
}
