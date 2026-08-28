import { useState, useEffect } from 'react'
import { adminCategories, adminAddCat, adminEditCat, adminDelCat } from '../services/adminApi'
import AdminLayout from '../components/AdminLayout'

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY = { name: '', slug: '', description: '' }

export default function AdminCategories() {
  const [cats, setCats]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [editCat, setEditCat]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [error, setError]       = useState('')

  const load = () => {
    setLoading(true)
    adminCategories().then(({ data }) => setCats(data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm(EMPTY); setEditCat(null); setError(''); setModal('add') }
  const openEdit = (c) => { setForm({ name: c.name, slug: c.slug, description: c.description }); setEditCat(c); setError(''); setModal('edit') }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'name') updated.slug = slugify(value)
      return updated
    })
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (modal === 'edit') await adminEditCat(editCat.id, form)
      else await adminAddCat(form)
      setModal(null); load()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' ') || 'Erreur.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await adminDelCat(id)
    setCats(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <AdminLayout>
      <div className="admin-page-title">
        <span>🗂️ Categories</span>
        <button className="btn-admin btn-gold" onClick={openAdd}>+ Ajouter une Categorie</button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-spinner"><div className="admin-spinner-ring" /></div>
        ) : cats.length === 0 ? (
          <div className="admin-empty"><div className="icon">📂</div><p>Aucune categorie</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Nom</th><th>Slug</th><th>Description</th><th>Produits</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: '#3D2B1F' }}>{c.name}</td>
                  <td><code style={{ background: '#F2EBE0', padding: '2px 6px', borderRadius: 4, fontSize: '0.78rem', color: '#6B4C3B' }}>{c.slug}</code></td>
                  <td style={{ fontSize: '0.82rem', color: '#8B6748', maxWidth: 200 }}>{c.description || '—'}</td>
                  <td>
                    <span style={{ background: '#C9A96E22', color: '#6B4C3B', fontWeight: 700, padding: '2px 10px', borderRadius: 20, fontSize: '0.82rem' }}>
                      {c.nb_produits}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-admin btn-outline-admin" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }} onClick={() => openEdit(c)}>✏️ Modifier</button>
                      <button className="btn-admin btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }} onClick={() => setDeleteConfirm(c)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'edit' ? '✏️ Modifier' : '+ Nouvelle Categorie'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label className="admin-label">Nom *</label>
                <input className="admin-input" name="name" value={form.name} onChange={handleChange} required autoFocus />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Slug</label>
                <input className="admin-input" name="slug" value={form.slug} onChange={handleChange} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Description</label>
                <textarea className="admin-input" name="description" rows={3} value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
              </div>
              {error && <div style={{ background: '#fdf2f2', border: '1px solid #f5c6c6', color: '#c0392b', padding: '0.7rem', borderRadius: 6, fontSize: '0.82rem' }}>⚠️ {error}</div>}
              <div className="modal-footer">
                <button type="button" className="btn-admin btn-outline-admin" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn-admin btn-gold" disabled={saving}>{saving ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="icon">⚠️</div>
              <h3>Supprimer cette categorie ?</h3>
              <p><strong>{deleteConfirm.name}</strong><br />Les {deleteConfirm.nb_produits} produits associes seront sans categorie.</p>
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
