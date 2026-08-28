import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder, getShippingRates } from '../services/api'
import './Checkout.css'

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

export default function Checkout() {
  const { items, sousTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    prenom:'', nom:'', whatsapp:'',
    pays:'Algerie', wilaya:'', commune:'', adresse:'',
    type_livraison:'domicile', notes:''
  })
  const [shippingRates, setShippingRates] = useState([])
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')

  // Load wilaya shipping rates
  useEffect(() => {
    getShippingRates()
      .then(({ data }) => setShippingRates(data))
      .catch(() => {})
  }, [])

  // Calculate shipping price based on selected wilaya + type
  const getShippingPrice = () => {
    if (!form.wilaya) return form.type_livraison === 'domicile' ? 600 : 370
    const rate = shippingRates.find(r => r.wilaya === form.wilaya)
    if (!rate) return form.type_livraison === 'domicile' ? 600 : 370
    return form.type_livraison === 'domicile'
      ? parseFloat(rate.price_domicile)
      : parseFloat(rate.price_bureau)
  }

  const getDomPrice = (wilaya) => {
    const rate = shippingRates.find(r => r.wilaya === wilaya)
    return rate ? parseFloat(rate.price_domicile) : 600
  }
  const getBurPrice = (wilaya) => {
    const rate = shippingRates.find(r => r.wilaya === wilaya)
    return rate ? parseFloat(rate.price_bureau) : 370
  }

  const frais = getShippingPrice()
  const total = sousTotal + frais

  if (items.length === 0) return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="empty-state" style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="icon">🛒</div>
        <h3>Votre panier est vide</h3>
        <Link to="/shop" className="btn btn-primary">Voir la Boutique</Link>
      </div>
    </main>
  )

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const payload = {
        ...form,
        items: items.map(i => ({
          product_id: i.id,
          quantity:   i.quantity,
          color_name: i.color_name || '',
          color_hex:  i.color_hex  || '',
        }))
      }
      const { data } = await createOrder(payload)
      clearCart()
      navigate(`/confirmation/${data.id}`)
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Une erreur est survenue. Veuillez reessayer.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="checkout-page page-enter" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="container">

        {/* Progress */}
        <div className="progress-bar">
          <div className="progress-step done"><span className="step-num">✓</span><span className="step-label">Panier</span></div>
          <div className="progress-line active"/>
          <div className="progress-step active"><span className="step-num">2</span><span className="step-label">Commande</span></div>
          <div className="progress-line"/>
          <div className="progress-step"><span className="step-num">3</span><span className="step-label">Confirmation</span></div>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>

            {/* Coordonnees */}
            <section className="form-section">
              <h3>📋 Vos Coordonnees</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Prenom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="ex: Fatima"/>
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleChange} required placeholder="ex: Bensalem"/>
                </div>
              </div>
              <div className="form-group">
                <label>Numero WhatsApp *</label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix">🇩🇿 +213</span>
                  <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="0550 123 456" type="tel"/>
                </div>
              </div>
            </section>

            {/* Adresse */}
            <section className="form-section">
              <h3>📍 Adresse de Livraison</h3>
              <div className="form-group">
                <label>Pays *</label>
                <input name="pays" value={form.pays} onChange={handleChange} required/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Wilaya *</label>
                  <select name="wilaya" value={form.wilaya} onChange={handleChange} required>
                    <option value="">-- Choisir votre wilaya --</option>
                    {WILAYAS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Commune / Ville *</label>
                  <input name="commune" value={form.commune} onChange={handleChange} required placeholder="ex: Hydra"/>
                </div>
              </div>
              <div className="form-group">
                <label>Adresse complete *</label>
                <textarea name="adresse" value={form.adresse} onChange={handleChange} required rows={3} placeholder="Rue, numero, batiment, etage..."/>
              </div>
            </section>

            {/* Livraison — shows real price per wilaya */}
            <section className="form-section livraison-section">
              <h3>🚚 Mode de Livraison</h3>
              {form.wilaya && (
                <div className="wilaya-price-note">
                  <span>📍 Prix de livraison pour <strong>{form.wilaya}</strong> :</span>
                </div>
              )}
              <div className="livraison-options">
                <label className={`liv-card ${form.type_livraison === 'domicile' ? 'selected' : ''}`}>
                  <input type="radio" name="type_livraison" value="domicile"
                    checked={form.type_livraison === 'domicile'} onChange={handleChange}/>
                  <div className="liv-card-content">
                    <div className="liv-icon">🏠</div>
                    <div className="liv-details">
                      <strong>Livraison a domicile</strong>
                      <span>Livraison directement chez vous</span>
                      <span className="liv-delay">3 - 5 jours ouvrables</span>
                    </div>
                    <div className="liv-price">
                      {form.wilaya
                        ? <>{getDomPrice(form.wilaya).toLocaleString('fr-DZ')} DA</>
                        : <>— DA</>
                      }
                    </div>
                  </div>
                </label>

                <label className={`liv-card ${form.type_livraison === 'bureau' ? 'selected' : ''}`}>
                  <input type="radio" name="type_livraison" value="bureau"
                    checked={form.type_livraison === 'bureau'} onChange={handleChange}/>
                  <div className="liv-card-content">
                    <div className="liv-icon">📦</div>
                    <div className="liv-details">
                      <strong>Bureau Yallidine</strong>
                      <span>Retrait dans le bureau le plus proche</span>
                      <span className="liv-delay">2 - 4 jours ouvrables</span>
                    </div>
                    <div className="liv-price">
                      {form.wilaya
                        ? <>{getBurPrice(form.wilaya).toLocaleString('fr-DZ')} DA</>
                        : <>— DA</>
                      }
                    </div>
                  </div>
                </label>
              </div>
              {!form.wilaya && (
                <p className="wilaya-hint">⬆️ Choisissez votre wilaya pour voir le prix exact.</p>
              )}
            </section>

            {/* Notes */}
            <section className="form-section">
              <h3>📝 Notes (optionnel)</h3>
              <div className="form-group">
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Instructions speciales pour la livraison..."/>
              </div>
            </section>

            {error && <div className="form-error">⚠️ {error}</div>}

            <button type="submit" className="btn btn-primary place-order-btn" disabled={submitting || !form.wilaya}>
              {submitting ? 'Envoi en cours...' : form.wilaya
                ? `✅ Commander — ${total.toLocaleString('fr-DZ')} DA`
                : '⬆️ Choisissez votre wilaya'
              }
            </button>
          </form>

          {/* Summary */}
          <div className="checkout-summary">
            <h3>Votre Commande</h3>
            {items.map(item => (
              <div key={item.key} className="co-item">
                <div className="co-item-img">
                  <img src={item.image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=70'} alt={item.name}
                    onError={e=>{e.target.src='https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=70'}}/>
                  <span className="co-qty">{item.quantity}</span>
                </div>
                <div className="co-name-wrap">
                  <span className="co-name">{item.name}</span>
                  {item.color_name && (
                    <div className="co-color">
                      <span className="co-color-dot" style={{ background: item.color_hex }}/>
                      <span>{item.color_name}</span>
                    </div>
                  )}
                </div>
                <span className="co-price">{(item.price * item.quantity).toLocaleString('fr-DZ')} DA</span>
              </div>
            ))}
            <div className="co-divider"/>
            <div className="co-row"><span>Sous-total</span><span>{sousTotal.toLocaleString('fr-DZ')} DA</span></div>
            <div className="co-row">
              <span>Livraison {form.wilaya ? `(${form.wilaya})` : ''}</span>
              <span>
                {form.wilaya
                  ? `${frais.toLocaleString('fr-DZ')} DA`
                  : <span style={{color:'#8B6748',fontSize:'.82rem'}}>Choisir wilaya</span>
                }
              </span>
            </div>
            <div className="co-divider"/>
            <div className="co-row co-total">
              <strong>TOTAL</strong>
              <strong>{form.wilaya ? `${total.toLocaleString('fr-DZ')} DA` : '— DA'}</strong>
            </div>
            <p className="co-whatsapp-note">📱 Nous vous contacterons sur WhatsApp pour confirmer votre commande.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
