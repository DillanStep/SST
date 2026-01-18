/**
 * @file main.tsx
 * @description React application entry point
 * 
 * This is the entry point for the SST Dashboard React application.
 * It mounts the App component to the DOM and sets up global styles.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * IMPORTS:
 * - Leaflet CSS for map components
 * - Tailwind CSS (via index.css)
 * - App root component
 * 
 * STRICT MODE:
 * React StrictMode is enabled for development warnings.
 * This causes double-renders in development (not production).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
