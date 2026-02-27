import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './lib/AuthContext'
import ErrorBoundary from './ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: 'var(--c-midnight-light)',
            color: '#fff',
            border: '1px solid var(--glass-border)',
          }
        }} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
