import { useState, useEffect } from 'react'
import { adminCommandes, adminUpdateCmd, adminDeleteCmd } from '../services/adminApi'
import AdminLayout from '../components/AdminLayout'

const STATUS_OPTS = [
  { value: '',           label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirme',   label: 'Confirme' },
  { value: 'expedie',    label: 'Expedie' },
  { value: 'livre',      label: 'Livre' },
  { value: 'annule',     label: 'Annule' },
]

const LIV_LABEL = { domicile: '🏠 Domicile', bureau: '📦 Yallidine' }

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = (params = {}) => {
    setLoading(true)
    adminCommandes(params).then(({ data }) => setCommandes(data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load({ status: filterStatus, search })
  }, [filterStatus, search])

  const handleStatusChange = async (id, newStatus) => {
    await adminUpdateCmd(id, { status: newStatus })
    load({ status: filterStatus, search })
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const handleDelete = async (id) => {
    await adminDeleteCmd(id)
    setCommandes(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    if (selected?.id === id) setSelected(null)
  }

  return (
    <AdminLayout>
      <div className="admin-page-title">
        <span>📦 Commandes</span>
        <span style={{ fontSize: '0.85rem', color: '#8B6748', fontFamily: 'Jost' }}>
          {commandes.length} commande{commandes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <input className="admin-input" placeholder="🔍 Rechercher nom ou WhatsApp..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STATUS_OPTS.map(opt => (
            <button key={opt.value}
              className={`btn-admin ${filterStatus === opt.value ? 'btn-dark' : 'btn-outline-admin'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
              onClick={() => setFilterStatus(opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-spinner"><div className="admin-spinner-ring" /></div>
        ) : commandes.length === 0 ? (
          <div className="admin-empty"><div className="icon">📭</div><p>Aucune commande trouvee</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Client</th><th>WhatsApp</th><th>Wilaya</th>
                  <th>Total</th><th>Livraison</th><th>Statut</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#C9A96E' }}>#{c.id}</td>
                    <td>
                      <button onClick={() => setSelected(c)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#3D2B1F', fontSize: '0.875rem', textAlign: 'left', padding: 0 }}>
                        {c.prenom} {c.nom}
                      </button>
                    </td>
                    <td>
                      <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer"
                        style={{ color: '#25D366', fontWeight: 500, textDecoration: 'none', fontSize: '0.82rem' }}>
                        📱 {c.whatsapp}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{c.wilaya}</td>
                    <td style={{ fontWeight: 700 }}>{Number(c.total).toLocaleString('fr-DZ')} DA</td>
                    <td style={{ fontSize: '0.78rem' }}>{LIV_LABEL[c.type_livraison]}</td>
                    <td>
                      <select className="status-select"
                        value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}>
                        {STATUS_OPTS.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#8B6748' }}>{c.created_at}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-admin btn-outline-admin" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                          onClick={() => setSelected(c)}>Voir</button>
                        <button className="btn-admin btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                          onClick={() => setDeleteConfirm(c)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Commande #{selected.id}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                ['Client', `${selected.prenom} ${selected.nom}`],
                ['WhatsApp', selected.whatsapp],
                ['Pays', selected.pays],
                ['Wilaya', selected.wilaya],
                ['Commune', selected.commune],
                ['Adresse', selected.adresse],
                ['Livraison', LIV_LABEL[selected.type_livraison]],
                ['Date', selected.created_at],
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.68rem', color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</p>
                  <p style={{ fontSize: '0.88rem', color: '#3D2B1F', fontWeight: 500 }}>{val}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ background: '#F2EBE0', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', color: '#6B4C3B' }}>
                📝 {selected.notes}
              </div>
            )}

            <h4 style={{ marginBottom: '0.75rem', color: '#3D2B1F' }}>Articles</h4>
            <table className="admin-table" style={{ marginBottom: '1rem' }}>
              <thead><tr><th>Article</th><th>Prix</th><th>Qte</th><th>Sous-total</th></tr></thead>
              <tbody>
                {selected.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.product_name}</td>
                    <td>{Number(item.product_price).toLocaleString('fr-DZ')} DA</td>
                    <td>{item.quantity}</td>
                    <td style={{ fontWeight: 600 }}>{Number(item.subtotal).toLocaleString('fr-DZ')} DA</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F2EBE0', paddingTop: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#8B6748' }}>Frais livraison : {Number(selected.frais_livraison).toLocaleString('fr-DZ')} DA</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3D2B1F' }}>Total : {Number(selected.total).toLocaleString('fr-DZ')} DA</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#8B6748' }}>Statut :</span>
                <select className="status-select" value={selected.status}
                  onChange={e => handleStatusChange(selected.id, e.target.value)}>
                  {STATUS_OPTS.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="icon">🗑️</div>
              <h3>Supprimer la commande ?</h3>
              <p>Commande #{deleteConfirm.id} de {deleteConfirm.prenom} {deleteConfirm.nom}<br />Cette action est irreversible.</p>
              <div className="btns">
                <button className="btn-admin btn-outline-admin" onClick={() => setDeleteConfirm(null)}>Annuler</button>
                <button className="btn-admin btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
