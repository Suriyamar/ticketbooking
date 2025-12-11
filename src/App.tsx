import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Booking from './pages/Booking' // existing page

import { AppProvider } from './context/AppContext'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="admin" element={<Admin />} />
            <Route path="booking/:id" element={<Booking />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
