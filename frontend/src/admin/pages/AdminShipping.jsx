import { useState, useEffect } from 'react'
import { adminGetShipping, adminUpdateShipping, adminAddShipping, adminDelShipping } from '../services/adminApi'
import AdminLayout from '../components/AdminLayout'
import './AdminShipping.css'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Bejaia','Biskra','Bechar',
  'Blida','Bouira','Tamanrasset','Tebessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Setif','Saida','Skikda','Sidi Bel Abbes','Annaba','Guelma',
  'Constantine','Medea','Mostaganem','MSila','Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arreridj','Boumerdes','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Ain Defla','Naama',
  'Ain Temouchent','Ghardaia','Relizane','Timimoun','Bordj Badji Mokhtar',
  'Ouled Djellal','Beni Abbes','In Salah','In Guezzam','Touggourt','Djanet',
  'El Meghaier','El Meniaa'
]

export default function AdminShipping() {
  const [rates, setRates]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [bulkMode, setBulkMode]   = useState(false)
  const [bulkDom, setBulkDom]     = useState('')
  const [bulkBur, setBulkBur]     = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)
  const [addModal, setAddModal]   = useState(false)
  const [addForm, setAddForm]     = useState({ wilaya:'', price_domicile:'', price_bureau:'' })
  const [toast, setToast]         = useState('')

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const load = () => {
    setLoading(true)
    adminGetShipping().then(({ data }) => setRates(data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = rates.filter(r =>
    r.wilaya.toLowerCase().includes(search.toLowerCase())
  )

  // Inline edit
  const startEdit = (r) => {
    setEditId(r.id)
    setEditForm({ price_domicile: r.price_domicile, price_bureau: r.price_bureau, is_active: r.is_active })
  }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      await adminUpdateShipping(id, editForm)
      setEditId(null)
      load()
      showToast('✅ Prix mis a jour !')
    } catch { showToast('❌ Erreur de sauvegarde.') }
    finally { setSaving(false) }
  }

  const toggleActive = async (r) => {
    await adminUpdateShipping(r.id, { is_active: !r.is_active })
    load()
  }

  // Bulk update
  const handleBulkSave = async () => {
    if (!bulkDom && !bulkBur) return
    setBulkSaving(true)
    try {
      await Promise.all(rates.map(r =>
        adminUpdateShipping(r.id, {
          ...(bulkDom ? { price_domicile: parseFloat(bulkDom) } : {}),
          ...(bulkBur ? { price_bureau:   parseFloat(bulkBur) } : {}),
        })
      ))
      setBulkDom(''); setBulkBur(''); setBulkMode(false)
      load()
      showToast(`✅ ${rates.length} wilayas mises a jour !`)
    } catch { showToast('❌ Erreur de mise a jour.') }
    finally { setBulkSaving(false) }
  }

  // Add new wilaya
  const handleAdd = async () => {
    if (!addForm.wilaya || !addForm.price_domicile || !addForm.price_bureau) return
    try {
      await adminAddShipping(addForm)
      setAddModal(false)
      setAddForm({ wilaya:'', price_domicile:'', price_bureau:'' })
      load()
      showToast('✅ Wilaya ajoutee !')
    } catch(e) {
      showToast('❌ ' + (Object.values(e.response?.data||{}).flat().join(' ') || 'Erreur'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce tarif ?')) return
    await adminDelShipping(id); load(); showToast('Tarif supprime.')
  }

  // Stats
  const avgDom = rates.length ? Math.round(rates.reduce((s,r)=>s+parseFloat(r.price_domicile),0)/rates.length) : 0
  const avgBur = rates.length ? Math.round(rates.reduce((s,r)=>s+parseFloat(r.price_bureau),0)/rates.length) : 0
  const minDom = rates.length ? Math.min(...rates.map(r=>parseFloat(r.price_domicile))) : 0
  const maxDom = rates.length ? Math.max(...rates.map(r=>parseFloat(r.price_domicile))) : 0

  return (
    <AdminLayout>
      <div className="admin-page-title">
        <span>🚚 Tarifs de Livraison</span>
        <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          <button className="btn-admin btn-outline-admin" onClick={() => setBulkMode(!bulkMode)}>
            {bulkMode ? '✕ Annuler' : '⚡ Modifier en lot'}
          </button>
          <button className="btn-admin btn-gold" onClick={() => setAddModal(true)}>+ Ajouter Wilaya</button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="shipping-stats">
        {[
          { label:'Wilayas configurees', value: rates.length,       icon:'🗺️' },
          { label:'Moy. Domicile',        value: `${avgDom} DA`,    icon:'🏠' },
          { label:'Moy. Bureau',          value: `${avgBur} DA`,    icon:'📦' },
          { label:'Min Domicile',         value: `${minDom} DA`,    icon:'⬇️' },
          { label:'Max Domicile',         value: `${maxDom} DA`,    icon:'⬆️' },
          { label:'Actives',              value: rates.filter(r=>r.is_active).length, icon:'✅' },
        ].map(s => (
          <div key={s.label} className="shipping-stat-card">
            <span className="s-icon">{s.icon}</span>
            <div>
              <p className="s-label">{s.label}</p>
              <p className="s-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk mode */}
      {bulkMode && (
        <div className="bulk-bar">
          <span style={{ fontWeight:600, color:'#3D2B1F', fontSize:'.9rem' }}>
            ⚡ Modifier toutes les wilayas d'un coup :
          </span>
          <div className="bulk-inputs">
            <div>
              <label className="admin-label">🏠 Domicile (DA)</label>
              <input className="admin-input" type="number" value={bulkDom}
                onChange={e=>setBulkDom(e.target.value)} placeholder="ex: 600" style={{width:120}}/>
            </div>
            <div>
              <label className="admin-label">📦 Bureau (DA)</label>
              <input className="admin-input" type="number" value={bulkBur}
                onChange={e=>setBulkBur(e.target.value)} placeholder="ex: 370" style={{width:120}}/>
            </div>
            <button className="btn-admin btn-gold" onClick={handleBulkSave} disabled={bulkSaving||(!bulkDom&&!bulkBur)}>
              {bulkSaving ? 'Mise a jour...' : `✅ Appliquer aux ${rates.length} wilayas`}
            </button>
          </div>
          <p style={{fontSize:'.78rem',color:'#8B6748',marginTop:'.5rem'}}>
            ⚠️ Laissez un champ vide pour ne pas modifier cette valeur.
          </p>
        </div>
      )}

      {/* Search */}
      <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1rem' }}>
        <input className="admin-input" placeholder="🔍 Rechercher une wilaya..." value={search}
          onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }}/>
        <span style={{ fontSize:'.82rem', color:'#8B6748' }}>{filtered.length} wilaya(s)</span>
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-spinner"><div className="admin-spinner-ring"/></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Wilaya</th>
                  <th>🏠 Livraison Domicile</th>
                  <th>📦 Bureau Yallidine</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ opacity: r.is_active ? 1 : 0.5 }}>
                    <td style={{ color:'#C9A96E', fontWeight:600, fontSize:'.8rem' }}>{i+1}</td>
                    <td>
                      <span style={{ fontWeight:600, color:'#3D2B1F' }}>{r.wilaya}</span>
                    </td>

                    {/* Price domicile */}
                    <td>
                      {editId === r.id ? (
                        <div className="price-edit-wrap">
                          <input className="admin-input price-input" type="number" min="0"
                            value={editForm.price_domicile}
                            onChange={e=>setEditForm({...editForm, price_domicile:e.target.value})}/>
                          <span className="da-label">DA</span>
                        </div>
                      ) : (
                        <span className="price-badge domicile">
                          🏠 {Number(r.price_domicile).toLocaleString('fr-DZ')} DA
                        </span>
                      )}
                    </td>

                    {/* Price bureau */}
                    <td>
                      {editId === r.id ? (
                        <div className="price-edit-wrap">
                          <input className="admin-input price-input" type="number" min="0"
                            value={editForm.price_bureau}
                            onChange={e=>setEditForm({...editForm, price_bureau:e.target.value})}/>
                          <span className="da-label">DA</span>
                        </div>
                      ) : (
                        <span className="price-badge bureau">
                          📦 {Number(r.price_bureau).toLocaleString('fr-DZ')} DA
                        </span>
                      )}
                    </td>

                    {/* Active toggle */}
                    <td>
                      <button className={`toggle ${r.is_active?'on':''}`} onClick={()=>toggleActive(r)}/>
                    </td>

                    {/* Actions */}
                    <td>
                      {editId === r.id ? (
                        <div style={{ display:'flex', gap:'.4rem' }}>
                          <button className="btn-admin btn-gold" style={{ padding:'.3rem .8rem', fontSize:'.75rem' }}
                            onClick={()=>saveEdit(r.id)} disabled={saving}>
                            {saving ? '...' : '💾 Sauver'}
                          </button>
                          <button className="btn-admin btn-outline-admin" style={{ padding:'.3rem .6rem', fontSize:'.75rem' }}
                            onClick={()=>setEditId(null)}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display:'flex', gap:'.4rem' }}>
                          <button className="btn-admin btn-outline-admin" style={{ padding:'.3rem .6rem', fontSize:'.75rem' }}
                            onClick={()=>startEdit(r)}>✏️ Modifier</button>
                          <button className="btn-admin btn-danger" style={{ padding:'.3rem .6rem', fontSize:'.75rem' }}
                            onClick={()=>handleDelete(r.id)}>🗑</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={()=>setAddModal(false)}>
          <div className="modal-box" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">+ Ajouter une Wilaya</h3>
              <button className="modal-close" onClick={()=>setAddModal(false)}>×</button>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Wilaya *</label>
              <select className="admin-input" value={addForm.wilaya}
                onChange={e=>setAddForm({...addForm, wilaya:e.target.value})}>
                <option value="">-- Choisir --</option>
                {WILAYAS.filter(w=>!rates.find(r=>r.wilaya===w)).map(w=>(
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="admin-form-group">
                <label className="admin-label">🏠 Domicile (DA) *</label>
                <input className="admin-input" type="number" min="0"
                  value={addForm.price_domicile} onChange={e=>setAddForm({...addForm,price_domicile:e.target.value})} placeholder="600"/>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">📦 Bureau (DA) *</label>
                <input className="admin-input" type="number" min="0"
                  value={addForm.price_bureau} onChange={e=>setAddForm({...addForm,price_bureau:e.target.value})} placeholder="370"/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-outline-admin" onClick={()=>setAddModal(false)}>Annuler</button>
              <button className="btn-admin btn-gold" onClick={handleAdd}
                disabled={!addForm.wilaya||!addForm.price_domicile||!addForm.price_bureau}>
                ✅ Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:'2rem', right:'2rem', background:'#3D2B1F', color:'#F2EBE0',
          padding:'1rem 1.5rem', borderRadius:10, fontSize:'.9rem', zIndex:9999,
          boxShadow:'0 8px 30px rgba(30,18,8,.3)', animation:'slideIn .3s ease' }}>
          {toast}
        </div>
      )}
    </AdminLayout>
  )
}
