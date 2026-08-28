import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const { itemCount }  = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner container">

        <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>

        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-fh">F&amp;H</span>
          <span className="logo-bags">BAGS</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {[['/', 'Accueil'], ['/shop', 'Boutique'], ['/about', 'A Propos'], ['/contact', 'Contact']].map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => isActive ? 'active' : ''}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" aria-label="Panier">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}
