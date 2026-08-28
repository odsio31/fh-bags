import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

function getBestImage(product) {
  // 1. main_image from API (absolute URL)
  if (product.main_image && product.main_image.startsWith('http')) return product.main_image
  // 2. gallery images
  if (product.images?.length > 0) {
    const main = product.images.find(i => i.is_main) || product.images[0]
    if (main.url && main.url.startsWith('http')) return main.url
    if (main.image_url) return main.image_url
  }
  // 3. direct image field
  if (product.image && product.image.startsWith('http')) return product.image
  if (product.image && product.image.startsWith('/')) return 'http://localhost:8000' + product.image
  // 4. image_url fallback
  if (product.image_url) return product.image_url
  // 5. placeholder
  return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)
  const imgSrc = getBestImage(product)
  const hasColors = product.colors?.length > 0

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (hasColors) return
    setAdding(true)
    addItem(product)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="card-image-wrap">
        <img src={imgSrc} alt={product.name} loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' }} />
        {product.is_featured && <span className="badge-tag">Vedette</span>}
        {!product.in_stock && <span className="badge-tag sold-out">Epuise</span>}
        <button className={`wish-btn ${wished ? 'wished' : ''}`}
          onClick={e => { e.preventDefault(); setWished(!wished) }} aria-label="Favoris">
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        <div className="card-overlay">
          {hasColors ? (
            <Link to={`/product/${product.slug}`} className="btn btn-primary quick-add"
              onClick={e => e.stopPropagation()}>
              Choisir la couleur
            </Link>
          ) : (
            <button className="btn btn-primary quick-add"
              onClick={handleAdd} disabled={!product.in_stock || adding}>
              {adding ? 'Ajoute ✓' : product.in_stock ? 'Ajouter au Panier' : 'Epuise'}
            </button>
          )}
        </div>
      </Link>
      <div className="card-info">
        {product.category_name && <span className="card-category">{product.category_name}</span>}
        <Link to={`/product/${product.slug}`}><h3 className="card-name">{product.name}</h3></Link>
        <div className="card-footer">
          <p className="card-price">{Number(product.price).toLocaleString('fr-DZ')} DA</p>
          {product.colors?.length > 0 && (
            <div className="card-colors">
              {product.colors.slice(0, 5).map(c => (
                <span key={c.id} className="card-color-dot" style={{ background: c.hex_code }} title={c.name} />
              ))}
              {product.colors.length > 5 && <span className="card-color-more">+{product.colors.length - 5}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
