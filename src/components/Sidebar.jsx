import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ open, toggle }) {
  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="header">
        <span>Menu</span>
        {/* only show the hamburger inside when sidebar is open */}
        {open && (
          <button
            className="hamburger-btn"
            onClick={toggle}
            aria-label="Collapse menu"
          >
            ☰
          </button>
        )}
      </div>
      <nav>
        <NavLink to="/"      end>Landing</NavLink>
        <NavLink to="/create">Create Lineup</NavLink>
        <NavLink to="/view"  >View Lineups</NavLink>
      </nav>
    </div>
  )
}
