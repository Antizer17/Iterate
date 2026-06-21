import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './iterate-app.jsx'
import {BrowserRouter, Link, useNavigate} from 'react-router-dom'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
