import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { NetworkProvider } from './contexts/NetworkContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NetworkProvider>
        <App />
      </NetworkProvider>
    </BrowserRouter>
  </StrictMode>,
)
