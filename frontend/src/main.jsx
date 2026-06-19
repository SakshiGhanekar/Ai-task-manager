import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize Theme, Density, and Primary Color from localStorage
const theme = localStorage.getItem('theme');
if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

const density = localStorage.getItem('density') || 'comfortable';
document.documentElement.dataset.density = density;

const primaryColor = localStorage.getItem('primaryColor') || 'blue';
document.documentElement.dataset.theme = primaryColor;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
