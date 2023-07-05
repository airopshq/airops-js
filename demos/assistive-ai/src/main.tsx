import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss';

ReactDOM.createRoot(document.getElementById('assistive-ai-demo') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
