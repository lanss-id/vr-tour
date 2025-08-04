import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { initializeAnalytics } from './utils/analytics'
import { initializeAccessibility } from './utils/accessibility'
import { initializeMonitoring } from './utils/monitoring'

// Initialize features
initializeAnalytics();
initializeAccessibility();
initializeMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
