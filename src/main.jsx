import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DocumentLanguage } from './components/DocumentLanguage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DocumentLanguage />
    <App />
  </StrictMode>,
)
