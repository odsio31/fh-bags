import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {
  const { items, sousTotal, updateItem, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="empty-state" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="icon">🛍️</div>
        <h3>Votre panier est vide</h3>
        <p>Decouvrez notre collection et trouvez votre sac ideal.</p>
        <Link to="/shop" className="btn btn-primary">Voir la Boutique</Link>
      </div>
    </main>
  )

  return (
    <main className="cart-page page-enter" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="container">
        <div className="cart-header">
          <h1>Mon Panier</h1>
          <span>{items.reduce((s,i)=>s+i.quantity,0)} article(s)</span>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.key} className="cart-item">
                <Link to={`/product/${item.slug}`} className="item-image">
                  <img src={item.image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=70'} alt={item.name} />
                </Link>

                <div className="item-info">
                  <Link to={`/product/${item.slug}`}><h3 className="item-name">{item.name}</h3></Link>
                  {/* Color badge */}
                  {item.color_name && (
                    <div className="item-color-badge">
                      <span className="item-color-dot" style={{ background: item.color_hex }} />
                      <span>{item.color_name}</span>
                    </div>
                  )}
                  <p className="item-unit-price">{Number(item.price).toLocaleString('fr-DZ')} DA / piece</p>
                </div>

                <div className="item-qty">
                  <div className="qty-control">
                    <button onClick={() => updateItem(item.key, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItem(item.key, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <div className="item-subtotal">
                  {(item.price * item.quantity).toLocaleString('fr-DZ')} DA
                </div>

                <button className="remove-btn" onClick={() => removeItem(item.key)} aria-label="Supprimer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Recapitulatif</h3>
            <div className="summary-row">
              <span>Sous-total</span>
              <span>{sousTotal.toLocaleString('fr-DZ')} DA</span>
            </div>
            <div className="livraison-info">
              <div className="liv-option"><span>🏠 A domicile</span></div>
              <div className="liv-option"><span>📦 Bureau Yallidine</span></div>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <strong>Sous-total</strong>
              <strong>{sousTotal.toLocaleString('fr-DZ')} DA</strong>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              Suivant → Commander
            </button>
            <Link to="/shop" className="continue-link">← Continuer les achats</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
