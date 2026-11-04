import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './iterate-app.jsx'
import {BrowserRouter} from 'react-router-dom'
import {AuthProvider} from '../src/context/AuthContext.jsx'
import { Analytics } from "@vercel/analytics/react"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
    <BrowserRouter>
    <App />
    <Analytics />
    </BrowserRouter>
    </AuthProvider> 
  </StrictMode>,
)
