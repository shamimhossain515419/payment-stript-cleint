import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Router from './Router/Router.jsx'
import { RouterProvider } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={Router}> </RouterProvider>
  </React.StrictMode>,
)
