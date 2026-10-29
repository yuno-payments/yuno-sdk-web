import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app'
import './styles.css'

// StrictMode stays on: useTransaction guards against the double effect run in development.
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
