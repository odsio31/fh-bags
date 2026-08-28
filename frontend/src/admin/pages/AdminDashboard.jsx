import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminStats } from '../services/adminApi'
import AdminLayout from '../components/AdminLayout'

const STATUS_LABELS = {
  en_attente: 'En attente', confirme: 'Confirme',
  expedie: 'Expedie', livre: 'Livre', annule: 'Annule'
}

function MiniBar({ value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <span style={{ fontSize: '0.65rem', color: '#8B6748' }}>{value > 0 ? value.toLocaleString('fr-DZ') : '0'}</span>
      <div style={{ width: '100%', height: 80, background: '#F2EBE0', borderRadius: 4, position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: `${pct}%`, background: '#C9A96E', borderRadius: 4, minHeight: pct > 0 ? 4 : 0, transition: 'height 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminStats().then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="admin-spinner"><div className="admin-spinner-ring" /></div></AdminLayout>

  const maxCA = Math.max(...(stats.chart?.map(d => d.ca) || [1]))

  return (
    <AdminLayout>
      <div className="admin-page-title">
        <span>📊 Dashboard</span>
        <span style={{ fontSize: '0.85rem', color: '#8B6748', fontFamily: 'Jost' }}>
          {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        {[
          { label: "CA Total",          value: `${Number(stats.ca_total).toLocaleString('fr-DZ')} DA`, icon: '💰', color: '#C9A96E' },
          { label: "CA Aujourd'hui",    value: `${Number(stats.ca_jour).toLocaleString('fr-DZ')} DA`,  icon: '📅', color: '#6B4C3B' },
          { label: "Total Commandes",   value: stats.total_commandes, icon: '📦', color: '#3D2B1F' },
          { label: "En Attente",        value: stats.en_attente,      icon: '⏳', color: '#856404' },
          { label: "Confirmees",        value: stats.confirme,        icon: '✅', color: '#0c5460' },
          { label: "Livrees",           value: stats.livre,           icon: '🎉', color: '#155724' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '18' }}>{s.icon}</div>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Last Orders ── */}
      <div className="dashboard-grid">

        {/* Chart */}
        <div className="admin-card chart-card">
          <div className="card-header">
            <h3>Ventes des 7 Derniers Jours</h3>
          </div>
          <div className="chart-body">
            <div className="chart-bars">
              {stats.chart?.map((d, i) => (
                <div key={i} className="chart-col">
                  <MiniBar value={d.ca} max={maxCA} />
                  <span className="chart-date">{d.date}</span>
                  <span className="chart-nb">{d.nb} cmd</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last 5 orders */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Dernieres Commandes</h3>
            <Link to="/admin/commandes" className="btn-admin btn-outline-admin" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
              Voir tout
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.last5?.map(o => (
                <tr key={o.id}>
                  <td style={{ color: '#8B6748', fontWeight: 600 }}>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.nom}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8B6748' }}>{o.wilaya}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#3D2B1F' }}>{Number(o.total).toLocaleString('fr-DZ')} DA</td>
                  <td><span className={`status-pill s-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
