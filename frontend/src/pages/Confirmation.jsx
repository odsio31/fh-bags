import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../services/api'
import './Confirmation.css'

export default function Confirmation() {
  const { id } = useParams()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id).then(({ data }) => setOrder(data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="spinner-wrap" style={{ minHeight:'80vh' }}><div className="spinner"/></div>
  if (!order)  return (
    <div className="empty-state" style={{ paddingTop:'calc(var(--nav-h) + 4rem)' }}>
      <h3>Commande introuvable</h3>
      <Link to="/" className="btn btn-primary">Accueil</Link>
    </div>
  )

  return (
    <main className="confirmation-page page-enter" style={{ paddingTop:'var(--nav-h)' }}>
      <div className="container">
        <div className="success-hero">
          <div className="success-icon">✅</div>
          <h1>Commande Confirmee !</h1>
          <p>Merci <strong>{order.prenom} {order.nom}</strong> ! Votre commande <strong>#{order.id}</strong> a ete recue.</p>
          <div className="whatsapp-notice">
            <span>📱</span>
            <div>
              <strong>Nous allons vous contacter sur WhatsApp</strong>
              <p>au <strong>{order.whatsapp}</strong> pour confirmer et organiser la livraison.</p>
            </div>
          </div>
        </div>

        <div className="confirmation-grid">
          <div className="conf-section">
            <h3>Articles Commandes</h3>
            {order.items.map(item => (
              <div key={item.id} className="conf-item">
                <span className="conf-qty">{item.quantity}x</span>
                <div className="conf-item-detail">
                  <span className="conf-name">{item.product_name}</span>
                  {item.color_name && (
                    <div className="conf-color">
                      <span className="conf-color-dot" style={{background:item.color_hex}}/>
                      <span>{item.color_name}</span>
                    </div>
                  )}
                </div>
                <span className="conf-price">
                  {(parseFloat(item.product_price)*item.quantity).toLocaleString('fr-DZ')} DA
                </span>
              </div>
            ))}
            <div className="conf-divider"/>
            <div className="conf-row"><span>Sous-total</span><span>{parseFloat(order.sous_total).toLocaleString('fr-DZ')} DA</span></div>
            <div className="conf-row">
              <span>Livraison ({order.type_livraison==='domicile'?'Domicile':'Bureau Yallidine'})</span>
              <span>{parseFloat(order.frais_livraison).toLocaleString('fr-DZ')} DA</span>
            </div>
            <div className="conf-divider"/>
            <div className="conf-row conf-total"><strong>TOTAL PAYE</strong><strong>{parseFloat(order.total).toLocaleString('fr-DZ')} DA</strong></div>
          </div>

          <div className="conf-section">
            <h3>Informations de Livraison</h3>
            <div className="conf-info-block">
              {[['Nom complet',`${order.prenom} ${order.nom}`],['WhatsApp',order.whatsapp],
                ['Wilaya',order.wilaya],['Commune',order.commune],['Adresse',order.adresse],
                ['Mode livraison',order.type_livraison==='domicile'?'🏠 A domicile':'📦 Bureau Yallidine'],
                ['Statut','En attente de confirmation'],
              ].map(([label,val])=>(
                <div key={label} className="conf-info-row">
                  <span className="conf-label">{label}</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="conf-actions">
          <Link to="/shop" className="btn btn-primary">Continuer les Achats</Link>
          <Link to="/" className="btn btn-outline">Retour a l'Accueil</Link>
        </div>
      </div>
    </main>
  )
}
