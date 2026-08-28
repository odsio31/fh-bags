import { useState, useEffect, useRef } from 'react'
import {
  adminProduits, adminAddProduit, adminEditProduit, adminDelProduit, adminCategories,
  adminGetImages, adminAddImage, adminSetMainImg, adminDelImage,
  adminGetColors, adminAddColor, adminEditColor, adminDelColor,
} from '../services/adminApi'
import AdminLayout from '../components/AdminLayout'
import './AdminProduits.css'

const EMPTY = { name:'', slug:'', description:'', price:'', stock:0, category_id:'', image_url:'', is_featured:false, is_available:true }
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const FALLBACK = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=60'

function getProductImg(p) {
  if (p.main_image && p.main_image.startsWith('http')) return p.main_image
  if (p.images?.length > 0) {
    const main = p.images.find(i => i.is_main) || p.images[0]
    if (main.url && main.url.startsWith('http')) return main.url
    if (main.image_url) return main.image_url
  }
  if (p.image && p.image.startsWith('/')) return 'http://localhost:8000' + p.image
  return p.image || p.image_url || FALLBACK
}

function getImgUrl(img) {
  if (img.url && img.url.startsWith('http')) return img.url
  if (img.image && img.image.startsWith('/')) return 'http://localhost:8000' + img.image
  return img.image_url || FALLBACK
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile }) {
  const ref  = useRef()
  const [drag, setDrag] = useState(false)
  const [err,  setErr]  = useState('')
  const validate = f => {
    if (!['image/jpeg','image/png','image/webp'].includes(f?.type)) { setErr('Format invalide (JPG/PNG/WEBP)'); return false }
    if (f.size > 5*1024*1024) { setErr('Max 5 MB'); return false }
    setErr(''); return true
  }
  const handle = f => { if (f && validate(f)) onFile(f) }
  return (
    <div>
      <div className={`upload-zone-sm ${drag?'dragging':''}`}
        onClick={()=>ref.current?.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0])}}>
        <span>📷</span><span>Cliquez ou glissez une photo</span>
        <span style={{fontSize:'.7rem',color:'#8B6748'}}>JPG PNG WEBP — max 5MB</span>
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={e=>handle(e.target.files[0])}/>
      {err && <p style={{color:'#c0392b',fontSize:'.75rem',marginTop:'.3rem'}}>⚠️ {err}</p>}
    </div>
  )
}

// ─── Image Manager ────────────────────────────────────────────────────────────
function ImageManager({ productId }) {
  const [images, setImages]   = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const load = () => adminGetImages(productId).then(r => setImages(r.data)).catch(()=>{})
  useEffect(()=>{ if(productId) load() },[productId])

  const handleUpload = async file => {
    setUploading(true); setProgress(0)
    const fd = new FormData(); fd.append('image', file)
    try {
      await adminAddImage(productId, fd, { onUploadProgress: e => setProgress(Math.round(e.loaded/e.total*100)) })
      load()
    } catch(err) { console.error(err) }
    finally { setUploading(false); setProgress(0) }
  }

  const setMain = async imgId => { await adminSetMainImg(productId, imgId, {is_main:true}); load() }
  const del     = async imgId => { await adminDelImage(productId, imgId); load() }

  return (
    <div className="img-manager">
      <div className="img-grid">
        {images.map(img => (
          <div key={img.id} className={`img-thumb ${img.is_main?'is-main':''}`}>
            <img src={getImgUrl(img)} alt="" onError={e=>{e.target.src=FALLBACK}}/>
            {img.is_main && <span className="main-badge">⭐ Principale</span>}
            <div className="img-thumb-actions">
              {!img.is_main && <button onClick={()=>setMain(img.id)} title="Definir comme principale">⭐</button>}
              <button onClick={()=>del(img.id)} className="del-btn">🗑</button>
            </div>
          </div>
        ))}
        <div className="img-add-slot">
          <UploadZone onFile={handleUpload}/>
          {uploading && (
            <div className="progress-wrap" style={{marginTop:'.5rem'}}>
              <div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
              <span className="progress-label">{progress}%</span>
            </div>
          )}
        </div>
      </div>
      {images.length === 0 && !uploading && (
        <p style={{color:'#8B6748',fontSize:'.82rem',marginTop:'.5rem'}}>Aucune photo. Ajoutez-en ci-dessus.</p>
      )}
    </div>
  )
}

// ─── Color Manager ────────────────────────────────────────────────────────────
function ColorManager({ productId }) {
  const [colors, setColors] = useState([])
  const [form, setForm]     = useState({name:'',hex_code:'#C19A6B',stock:0})
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const load = () => adminGetColors(productId).then(r=>setColors(r.data)).catch(()=>{})
  useEffect(()=>{ if(productId) load() },[productId])

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      if (editId) { await adminEditColor(productId, editId, form); setEditId(null) }
      else await adminAddColor(productId, form)
      setForm({name:'',hex_code:'#C19A6B',stock:0}); load()
    } catch(e){ console.error(e) }
    finally { setSaving(false) }
  }
  const startEdit = c => { setEditId(c.id); setForm({name:c.name,hex_code:c.hex_code,stock:c.stock}) }
  const del = async cid => { await adminDelColor(productId, cid); load() }

  return (
    <div className="color-manager">
      <div className="color-list">
        {colors.length === 0 && <p style={{color:'#8B6748',fontSize:'.82rem'}}>Aucune couleur. Ajoutez-en ci-dessous.</p>}
        {colors.map(c => (
          <div key={c.id} className="color-row">
            <div className="color-swatch" style={{background:c.hex_code}}/>
            <div className="color-info">
              <span className="color-name">{c.name}</span>
              <code className="color-hex">{c.hex_code}</code>
            </div>
            <div className="color-stock">
              <span style={{color:c.stock<3?'#c0392b':'#155724',fontWeight:600}}>{c.stock} en stock</span>
            </div>
            <div className="color-actions">
              <button className="btn-admin btn-outline-admin" style={{padding:'.25rem .5rem',fontSize:'.7rem'}} onClick={()=>startEdit(c)}>✏️</button>
              <button className="btn-admin btn-danger"        style={{padding:'.25rem .5rem',fontSize:'.7rem'}} onClick={()=>del(c.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      <div className="color-add-form">
        <h5 style={{marginBottom:'.75rem',color:'#3D2B1F',fontSize:'.85rem'}}>{editId?'✏️ Modifier':'+ Ajouter une couleur'}</h5>
        <div className="color-form-row">
          <div className="admin-form-group" style={{flex:2}}>
            <label className="admin-label">Nom</label>
            <input className="admin-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="ex: Camel"/>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Couleur</label>
            <div className="color-picker-wrap">
              <input type="color" value={form.hex_code} onChange={e=>setForm({...form,hex_code:e.target.value})} className="color-input-native"/>
              <input className="admin-input" value={form.hex_code} onChange={e=>setForm({...form,hex_code:e.target.value})} placeholder="#C19A6B" style={{width:90,fontFamily:'monospace',fontSize:'.8rem'}}/>
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Stock</label>
            <input className="admin-input" type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value)||0})} style={{width:80}}/>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:'.4rem',paddingBottom:'.1rem'}}>
            <button className="btn-admin btn-gold" onClick={handleSave} disabled={saving||!form.name}>{saving?'...':editId?'Modifier':'Ajouter'}</button>
            {editId && <button className="btn-admin btn-outline-admin" onClick={()=>{setEditId(null);setForm({name:'',hex_code:'#C19A6B',stock:0})}}>✕</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminProduits() {
  const [produits, setProduits]       = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [imageFile, setImageFile]     = useState(null)
  const [progress, setProgress]       = useState(0)
  const [saving, setSaving]           = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [error, setError]             = useState('')
  const [activeTab, setActiveTab]     = useState('info')
  const [savedId, setSavedId]         = useState(null)
  const imgInputRef                   = useRef()

  const load = () => {
    setLoading(true)
    Promise.all([adminProduits(), adminCategories()])
      .then(([p,c])=>{ setProduits(p.data); setCategories(c.data) })
      .finally(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const openAdd = () => { setForm(EMPTY); setEditProduct(null); setImageFile(null); setError(''); setProgress(0); setActiveTab('info'); setSavedId(null); setModal('form') }
  const openEdit = p => {
    setForm({ name:p.name,slug:p.slug,description:p.description,price:p.price,stock:p.stock,category_id:p.category?.id||'',image_url:p.image_url||'',is_featured:p.is_featured,is_available:p.is_available })
    setEditProduct(p); setImageFile(null); setError(''); setProgress(0); setActiveTab('info'); setSavedId(p.id); setModal('form')
  }
  const handleChange = e => {
    const {name,value,type,checked} = e.target
    setForm(prev=>{ const u={...prev,[name]:type==='checkbox'?checked:value}; if(name==='name') u.slug=slugify(value); return u })
  }
  const handleToggle = async p => { const fd=new FormData(); fd.append('is_available',!p.is_available); await adminEditProduit(p.id,fd); load() }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setError(''); setProgress(10)
    const fd = new FormData()
    Object.entries(form).forEach(([k,v])=>fd.append(k,v))
    if (imageFile) fd.append('image', imageFile)
    try {
      let res
      const cfg = { onUploadProgress: ev => setProgress(Math.round(ev.loaded/ev.total*85)) }
      if (editProduct) res = await adminEditProduit(editProduct.id, fd, cfg)
      else             res = await adminAddProduit(fd, cfg)
      setProgress(100); setSavedId(res.data.id); setActiveTab('images'); load()
    } catch(err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Erreur de sauvegarde.')
      setProgress(0)
    } finally { setSaving(false) }
  }

  const handleDelete = async id => { await adminDelProduit(id); setProduits(prev=>prev.filter(p=>p.id!==id)); setDeleteConfirm(null) }

  const TABS = [
    {key:'info',   label:'📝 Informations'},
    {key:'images', label:'🖼️ Photos',   disabled:!savedId},
    {key:'colors', label:'🎨 Couleurs', disabled:!savedId},
  ]

  return (
    <AdminLayout>
      <div className="admin-page-title">
        <span>🛍️ Produits</span>
        <button className="btn-admin btn-gold" onClick={openAdd}>+ Ajouter</button>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-spinner"><div className="admin-spinner-ring"/></div>
        : produits.length===0 ? <div className="admin-empty"><div className="icon">📦</div><p>Aucun produit.</p></div>
        : (
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead><tr><th>Photo</th><th>Nom</th><th>Categorie</th><th>Prix</th><th>Stock/Couleurs</th><th>Vedette</th><th>Dispo</th><th>Actions</th></tr></thead>
              <tbody>
                {produits.map(p=>(
                  <tr key={p.id}>
                    <td>
                      <div className="product-thumb-wrap">
                        <img src={getProductImg(p)} alt={p.name} className="product-thumb"
                          onError={e=>{e.target.src=FALLBACK}}/>
                        {p.images?.length>1 && <span className="img-count">+{p.images.length-1}</span>}
                      </div>
                    </td>
                    <td><div style={{fontWeight:600,color:'#3D2B1F'}}>{p.name}</div><div style={{fontSize:'.72rem',color:'#8B6748'}}>{p.slug}</div></td>
                    <td style={{fontSize:'.82rem'}}>{p.category?.name||'—'}</td>
                    <td style={{fontWeight:700}}>{Number(p.price).toLocaleString('fr-DZ')} DA</td>
                    <td>
                      {p.colors?.length>0 ? (
                        <div className="color-dots">{p.colors.map(c=><span key={c.id} className="color-dot" style={{background:c.hex_code}} title={`${c.name}: ${c.stock}`}/>)}</div>
                      ) : <span style={{fontWeight:600,color:p.stock<5?'#c0392b':'#155724'}}>{p.stock}</span>}
                    </td>
                    <td style={{textAlign:'center'}}>{p.is_featured?'⭐':'—'}</td>
                    <td><button className={`toggle ${p.is_available?'on':''}`} onClick={()=>handleToggle(p)}/></td>
                    <td>
                      <div style={{display:'flex',gap:'.4rem'}}>
                        <button className="btn-admin btn-outline-admin" style={{padding:'.3rem .6rem',fontSize:'.72rem'}} onClick={()=>openEdit(p)}>✏️</button>
                        <button className="btn-admin btn-danger"        style={{padding:'.3rem .6rem',fontSize:'.72rem'}} onClick={()=>setDeleteConfirm(p)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>!saving&&setModal(null)}>
          <div className="modal-box modal-xl" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editProduct?`✏️ ${editProduct.name}`:'+ Nouveau Produit'}</h3>
              <button className="modal-close" onClick={()=>setModal(null)}>×</button>
            </div>
            <div className="modal-tabs">
              {TABS.map(t=>(
                <button key={t.key} className={`modal-tab ${activeTab===t.key?'active':''} ${t.disabled?'disabled':''}`}
                  onClick={()=>!t.disabled&&setActiveTab(t.key)} disabled={t.disabled}>
                  {t.label}{t.disabled&&<span style={{fontSize:'.65rem',marginLeft:'.3rem'}}>(sauvegarder d'abord)</span>}
                </button>
              ))}
            </div>

            {activeTab==='info' && (
              <form onSubmit={handleSave}>
                <div className="produit-form-grid">
                  <div className="form-left">
                    <label className="admin-label" style={{marginBottom:'.5rem',display:'block'}}>Photo principale</label>
                    {imageFile ? (
                      <div className="image-preview-wrap" style={{maxHeight:220}}>
                        <img src={URL.createObjectURL(imageFile)} alt="" className="image-preview"/>
                        <div className="image-preview-overlay">
                          <button type="button" className="change-img-btn" onClick={()=>setImageFile(null)}>🗑 Retirer</button>
                        </div>
                      </div>
                    ) : (editProduct && getProductImg(editProduct) !== FALLBACK) ? (
                      <div className="image-preview-wrap" style={{maxHeight:220}}>
                        <img src={getProductImg(editProduct)} alt="" className="image-preview" onError={e=>{e.target.src=FALLBACK}}/>
                        <div className="image-preview-overlay">
                          <button type="button" className="change-img-btn" onClick={()=>imgInputRef.current?.click()}>📷 Changer</button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-zone" onClick={()=>imgInputRef.current?.click()}>
                        <div className="upload-icon">📷</div>
                        <p className="upload-main">Cliquez pour ajouter une photo</p>
                        <p className="upload-sub">JPG PNG WEBP — max 5MB</p>
                      </div>
                    )}
                    <input ref={imgInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}}
                      onChange={e=>setImageFile(e.target.files[0]||null)}/>
                    <div className="admin-form-group" style={{marginTop:'.75rem'}}>
                      <label className="admin-label">Ou URL image (fallback)</label>
                      <input className="admin-input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..."/>
                    </div>
                  </div>
                  <div className="form-right">
                    <div className="admin-form-group"><label className="admin-label">Nom *</label><input className="admin-input" name="name" value={form.name} onChange={handleChange} required autoFocus/></div>
                    <div className="admin-form-group"><label className="admin-label">Slug</label><input className="admin-input" name="slug" value={form.slug} onChange={handleChange} required style={{fontFamily:'monospace',fontSize:'.82rem'}}/></div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
                      <div className="admin-form-group"><label className="admin-label">Prix (DA) *</label><input className="admin-input" name="price" type="number" min="0" value={form.price} onChange={handleChange} required/></div>
                      <div className="admin-form-group"><label className="admin-label">Stock global</label><input className="admin-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange}/></div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Categorie</label>
                      <select className="admin-input" name="category_id" value={form.category_id} onChange={handleChange}>
                        <option value="">-- Aucune --</option>
                        {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="admin-form-group"><label className="admin-label">Description *</label><textarea className="admin-input" name="description" rows={4} value={form.description} onChange={handleChange} required style={{resize:'vertical'}}/></div>
                    <div className="options-row">
                      <label className="option-check"><input type="checkbox" name="is_featured"  checked={form.is_featured}  onChange={handleChange}/><span>⭐ Mis en avant</span></label>
                      <label className="option-check"><input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange}/><span>✅ Disponible</span></label>
                    </div>
                  </div>
                </div>
                {saving && progress>0 && <div className="progress-wrap"><div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}/></div><span className="progress-label">{progress}%</span></div>}
                {error && <div style={{background:'#fdf2f2',border:'1px solid #f5c6c6',color:'#c0392b',padding:'.7rem',borderRadius:6,fontSize:'.82rem',marginTop:'.75rem'}}>⚠️ {error}</div>}
                <div className="modal-footer">
                  <button type="button" className="btn-admin btn-outline-admin" onClick={()=>setModal(null)} disabled={saving}>Annuler</button>
                  <button type="submit" className="btn-admin btn-gold" disabled={saving}>{saving?`Sauvegarde... ${progress}%`:'💾 Sauvegarder → Photos'}</button>
                </div>
              </form>
            )}

            {activeTab==='images' && savedId && (
              <div style={{padding:'1rem 0'}}>
                <p style={{fontSize:'.85rem',color:'#8B6748',marginBottom:'1rem'}}>Ajoutez plusieurs photos. La premiere est automatiquement la principale.</p>
                <ImageManager productId={savedId}/>
                <div className="modal-footer">
                  <button className="btn-admin btn-outline-admin" onClick={()=>setActiveTab('info')}>← Infos</button>
                  <button className="btn-admin btn-gold" onClick={()=>setActiveTab('colors')}>Couleurs →</button>
                </div>
              </div>
            )}

            {activeTab==='colors' && savedId && (
              <div style={{padding:'1rem 0'}}>
                <p style={{fontSize:'.85rem',color:'#8B6748',marginBottom:'1rem'}}>Ajoutez les couleurs avec leur stock individuel.</p>
                <ColorManager productId={savedId}/>
                <div className="modal-footer">
                  <button className="btn-admin btn-outline-admin" onClick={()=>setActiveTab('images')}>← Photos</button>
                  <button className="btn-admin btn-gold" onClick={()=>{setModal(null);load()}}>✅ Terminer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={()=>setDeleteConfirm(null)}>
          <div className="modal-box" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="icon">🗑️</div>
              <h3>Supprimer ce produit ?</h3>
              <p><strong>{deleteConfirm.name}</strong><br/>Cette action est irreversible.</p>
              <div className="btns">
                <button className="btn-admin btn-outline-admin" onClick={()=>setDeleteConfirm(null)}>Annuler</button>
                <button className="btn-admin btn-danger" onClick={()=>handleDelete(deleteConfirm.id)}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
