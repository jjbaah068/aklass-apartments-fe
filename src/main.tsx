import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadPublicSettings } from './lib/hooks'

// Start waking the booking server the moment any page opens, so it's usually
// ready by the time a guest reaches the booking page. Pages reuse this request.
loadPublicSettings().catch(() => { /* pages retry on their own */ })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
