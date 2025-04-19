// src/App.jsx
import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar      from './components/Sidebar'
import Landing      from './pages/Landing'
import CreateLineup from './pages/CreateLineup'
import ViewLineups  from './pages/ViewLineups'
import EditLineup   from './pages/EditLineup'    // ← add this

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar open={sidebarOpen} />

      {/* always-visible toggle */}
      <button
        className="toggle-btn"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className="content">
        <Routes>
          <Route path="/"      element={<Landing />} />
          <Route path="/create" element={<CreateLineup />} />
          <Route path="/view"   element={<ViewLineups />} />
          <Route path="/edit/:id" element={<EditLineup />} />  {/* ← and this */}
        </Routes>
      </div>
    </div>
  )
}
