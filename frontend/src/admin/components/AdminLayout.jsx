import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import './AdminLayout.css'

const NAV = [
  { to: '/admin',             icon: '📊', label: 'Dashboard',   exact: true },
  { to: '/admin/commandes',   icon: '📦', label: 'Commandes' },
  { to: '/admin/produits',    icon: '🛍️', label: 'Produits' },
  { to: '/admin/categories',  icon: '🗂️', label: 'Categories' },
  { to: '/admin/livraison',   icon: '🚚', label: 'Livraison' },
]

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth()
  const navigate          = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-fh">F&amp;H</span>
          <span className="logo-admin">ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSideOpen(false)}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <div className="user-avatar">{admin?.username?.[0]?.toUpperCase()}</div>
            <span>{admin?.username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Deconnexion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {sideOpen && <div className="admin-overlay" onClick={() => setSideOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="burger-admin" onClick={() => setSideOpen(!sideOpen)}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">F&amp;H Bags — Espace Admin</span>
          <a href="/" target="_blank" className="view-site-btn">🌐 Voir le site</a>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
