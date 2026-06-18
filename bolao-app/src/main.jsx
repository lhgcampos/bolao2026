import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.prebuilt.css'
import './theme.runtime.css'
import App from './App.jsx'
import { applyThemeToDocument, getStoredThemePreference, getSystemTheme, resolveThemePreference } from './theme.js'

applyThemeToDocument(resolveThemePreference(getStoredThemePreference(), getSystemTheme()))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
