// Same ten names as clients/vanilla. One route, one file, one scenario.
export const scenarios = [
  { path: 'card-form-managed', title: 'Card form · managed', blurb: 'SDK renders the card form and creates the payment.', load: () => import('./scenarios/card-form-managed').then((m) => m.CardFormManaged) },
  { path: 'card-form-manual', title: 'Card form · manual', blurb: 'SDK renders the form, your server creates the payment in createPayment.', load: () => import('./scenarios/card-form-manual').then((m) => m.CardFormManual) },
  { path: 'card-form-own-button', title: 'Card form · your own pay button', blurb: 'showPayButton: false and transaction.submit().', load: () => import('./scenarios/card-form-own-button').then((m) => m.CardFormOwnButton) },
  { path: 'payment-list-managed', title: 'Payment method list · managed', blurb: 'Standalone list, select, then start().', load: () => import('./scenarios/payment-list-managed').then((m) => m.PaymentListManaged) },
  { path: 'payment-list-manual', title: 'Payment method list · manual', blurb: 'Same list with createPayment.', load: () => import('./scenarios/payment-list-manual').then((m) => m.PaymentListManual) },
  { path: 'wallets', title: 'Wallet buttons', blurb: 'Apple Pay, Google Pay and PayPal buttons in your own layout.', load: () => import('./scenarios/wallets').then((m) => m.Wallets) },
  { path: 'headless', title: 'Headless', blurb: 'No SDK UI: you pass the card data to start().', load: () => import('./scenarios/headless').then((m) => m.Headless) },
  { path: 'secure-fields', title: 'Secure fields', blurb: 'PCI-isolated card fields inside your own form.', load: () => import('./scenarios/secure-fields').then((m) => m.SecureFields) },
  { path: 'enrollment', title: 'Enrollment', blurb: 'Save a card with a customer session instead of a checkout session.', load: () => import('./scenarios/enrollment').then((m) => m.Enrollment) },
  { path: 'show-loading', title: 'Your own loader', blurb: 'showLoading replaces the SDK overlay.', load: () => import('./scenarios/show-loading').then((m) => m.ShowLoading) },
]
