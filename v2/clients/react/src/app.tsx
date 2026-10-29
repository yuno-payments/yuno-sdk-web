import type { ReactNode } from 'react'
import { createBrowserRouter, Link } from 'react-router-dom'
import { CardFormManaged } from './scenarios/card-form-managed'
import { CardFormManual } from './scenarios/card-form-manual'
import { CardFormOwnButton } from './scenarios/card-form-own-button'
import { PaymentListManaged } from './scenarios/payment-list-managed'
import { PaymentListManual } from './scenarios/payment-list-manual'
import { Wallets } from './scenarios/wallets'
import { Headless } from './scenarios/headless'
import { SecureFields } from './scenarios/secure-fields'
import { Enrollment } from './scenarios/enrollment'
import { ShowLoading } from './scenarios/show-loading'

// Same ten names as clients/vanilla. One route, one file, one scenario.
export const scenarios = [
  { path: 'card-form-managed', title: 'Card form · managed', blurb: 'SDK renders the card form and creates the payment.', element: <CardFormManaged /> },
  { path: 'card-form-manual', title: 'Card form · manual', blurb: 'SDK renders the form, your server creates the payment in createPayment.', element: <CardFormManual /> },
  { path: 'card-form-own-button', title: 'Card form · your own pay button', blurb: 'showPayButton: false and transaction.submit().', element: <CardFormOwnButton /> },
  { path: 'payment-list-managed', title: 'Payment method list · managed', blurb: 'Standalone list, select, then start().', element: <PaymentListManaged /> },
  { path: 'payment-list-manual', title: 'Payment method list · manual', blurb: 'Same list with createPayment.', element: <PaymentListManual /> },
  { path: 'wallets', title: 'Wallet buttons', blurb: 'Apple Pay, Google Pay and PayPal buttons in your own layout.', element: <Wallets /> },
  { path: 'headless', title: 'Headless', blurb: 'No SDK UI: you pass the card data to start().', element: <Headless /> },
  { path: 'secure-fields', title: 'Secure fields', blurb: 'PCI-isolated card fields inside your own form.', element: <SecureFields /> },
  { path: 'enrollment', title: 'Enrollment', blurb: 'Save a card with a customer session instead of a checkout session.', element: <Enrollment /> },
  { path: 'show-loading', title: 'Your own loader', blurb: 'showLoading replaces the SDK overlay.', element: <ShowLoading /> },
]

function ScenarioList() {
  return (
    <>
      <h1>Universal SDK (v2) · React</h1>
      <p>Each route is one scenario: one component, no shared abstraction beyond the useTransaction hook.</p>
      <ul className="scenarios">
        {scenarios.map((s) => (
          <li key={s.path}><Link to={`/${s.path}`}>{s.title}</Link><small>{s.blurb}</small></li>
        ))}
      </ul>
    </>
  )
}

export function Scenario({ path, status, children }: { path: string; status: string; children: ReactNode }) {
  const s = scenarios.find((x) => x.path === path)!
  return (
    <>
      <Link className="back" to="/">← All scenarios</Link>
      <h1>{s.title}</h1>
      <p>{s.blurb}</p>
      {children}
      <p id="status" className="status">{status}</p>
    </>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <ScenarioList /> },
  ...scenarios.map(({ path, element }) => ({ path: `/${path}`, element })),
])
