// Entry point — mounts the React tree into the #root div from index.html.
// I wrapped everything in BrowserRouter here so that any component anywhere
// in the app can use the React Router hooks without extra setup.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
