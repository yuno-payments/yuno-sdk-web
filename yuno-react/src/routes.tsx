import { createBrowserRouter } from "react-router-dom"
import { Links } from "./components/link"
import { CardForm } from './components/card-form'
import { ApmListLite } from "./components/apm-lite-list"
import { SplitCheckout } from "./components/split-checkout"

export const router = createBrowserRouter([
  {
    path: '/secure-fields',
    element: <CardForm />,
  },
  {
    path: '/apm-lite-list',
    element: <ApmListLite customLoader={false}/>
  },
  {
    path: '/apm-lite-list/custom-loader',
    element: <ApmListLite customLoader={true}/>
  },
  {
    path: '/split-checkout',
    element: <SplitCheckout />,
  },
  {
    path: '*',
    element: <Links />,
  },
])
