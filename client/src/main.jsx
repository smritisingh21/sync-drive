import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';


const clientId = '161294537714-gumoisc3do5pm9mmcf91ju4t51emka0t.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>

    <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
