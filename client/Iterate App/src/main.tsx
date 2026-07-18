import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './iterate-app.jsx'
import {BrowserRouter, Link, useNavigate} from 'react-router-dom'
import {AuthProvider} from '../src/context/AuthContext.jsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </AuthProvider> 
  </StrictMode>,
)
