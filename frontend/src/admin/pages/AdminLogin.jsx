import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import './AdminLogin.css'

export default function AdminLogin() {
  const { login }   = useAdminAuth()
  const navigate    = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(form)
      navigate('/admin')
    } catch {
      setError('Identifiants incorrects ou acces refuse.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-fh">F&amp;H</span>
          <span className="logo-admin">BAGS</span>
        </div>
        <h2>Espace Administrateur</h2>
        <p className="login-sub">Connectez-vous pour gerer votre boutique</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="admin-form-group">
            <label className="admin-label">Nom d'utilisateur</label>
            <input className="admin-input" type="text" required autoFocus
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="admin" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Mot de passe</label>
            <input className="admin-input" type="password" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" />
          </div>
          {error && <div className="login-error">⚠️ {error}</div>}
          <button type="submit" className="btn-admin btn-dark login-btn" disabled={loading}>
            {loading ? 'Connexion...' : '🔐 Se Connecter'}
          </button>
        </form>

        <a href="/" className="back-site">← Retour au site</a>
      </div>
    </div>
  )
}
