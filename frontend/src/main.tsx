import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { store } from './store/store'
import { refreshAuth } from './store/slices/authSlice'

// Try to refresh auth on app load
const token = localStorage.getItem('auth_token')
if (token) {
  store.dispatch(refreshAuth())
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

