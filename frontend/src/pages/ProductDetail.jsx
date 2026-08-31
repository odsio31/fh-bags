import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct } from '../services/api'
import { useCart } from '../context/CartContext'
import './ProductDetail.css'

const FALLBACK = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80'

function getBestImage(product) {
  if (product.main_image && product.main_image.startsWith('http')) return product.main_image
  if (product.image && product.image.startsWith('/')) return 'https://fh-bags.onrender.com' + product.image
  return product.image || product.image_url || FALLBACK
}

function getImageUrl(imgObj) {
  if (imgObj.url && imgObj.url.startsWith('http')) return imgObj.url
  if (imgObj.image && imgObj.image.startsWith('/')) return 'https://fh-bags.onrender.com' + imgObj.image
  return imgObj.image_url || FALLBACK
}

export default function ProductDetail() {
  const { slug }    = useParams()
  const navigate    = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [mainImg, setMainImg]   = useState(null)
  const [qty, setQty]           = useState(1)
  const [selectedColor, setSelectedColor] = useState(null)
  const [added, setAdded]       = useState(false)
  const [colorError, setColorError] = useState('')
  const [tab, setTab]           = useState('description')

  useEffect(() => {
    setLoading(true)
    getProduct(slug)
      .then(({ data }) => {
        setProduct(data)
        setMainImg(getBestImage(data))
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  // إضافة للمجموع (إضافة فقط)
  const handleAdd = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      setColorError('Veuillez choisir une couleur avant d\'ajouter au panier.')
      return
    }
    setColorError('')
    addItem(product, qty, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // الشراء المباشر (إضافة + تحويل مباشر لصفحة الدفع)
  const handleBuyNow = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      setColorError('Veuillez choisir une couleur avant d\'acheter.')
      return
    }
    setColorError('')
    addItem(product, qty, selectedColor)
    navigate('/checkout')
  }

  const getStockInfo = () => selectedColor ? selectedColor.stock : (product?.stock || 0)
  const isInStock    = () => selectedColor ? selectedColor.stock > 0 : product?.in_stock

  if (loading) return <div className="spinner-wrap" style={{ minHeight: '80vh' }}><div className="spinner" /></div>
  if (!product) return (
    <div className="empty-state" style={{ paddingTop: 'calc(var(--nav-h) + 4rem)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="icon">😕</div>
      <h3>Produit introuvable</h3>
      <Link to="/shop" className="btn btn-outline">Retour a la Boutique</Link>
    </div>
  )

  const galleryImages = product.images?.length > 0
    ? product.images.map(i => ({ src: getImageUrl(i), id: i.id, isMain: i.is_main }))
    : [{ src: getBestImage(product), id: 0, isMain: true }]

  return (
    <main className="product-detail page-enter" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Accueil</Link><span>/</span>
          <Link to="/shop">Boutique</Link><span>/</span>
          {product.category && <><Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link><span>/</span></>}
          <span className="crumb-current">{product.name}</span>
        </nav>

        <div className="detail-grid">
          {/* ── Gallery ── */}
          <div className="detail-image">
            <div className="main-image">
              <img src={mainImg || FALLBACK} alt={product.name}
                onError={e => { e.target.src = FALLBACK }}
                key={mainImg} style={{ transition: 'opacity 0.3s' }} />
              {!isInStock() && <div className="sold-out-overlay">Epuise</div>}
            </div>
            {galleryImages.length > 1 && (
              <div className="thumbnails">
                {galleryImages.map((img, i) => (
                  <button key={img.id || i}
                    className={`thumb-btn ${mainImg === img.src ? 'active' : ''}`}
                    onClick={() => setMainImg(img.src)}>
                    <img src={img.src} alt={`Vue ${i + 1}`}
                      onError={e => { e.target.src = FALLBACK }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="detail-info">
            {product.category && (
              <Link to={`/shop?category=${product.category.slug}`} className="detail-category">
                {product.category.name}
              </Link>
            )}
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-price">{Number(product.price).toLocaleString('fr-DZ')} DA</p>
            <div className="detail-divider" />
            <p className="detail-desc-short">{product.description?.split('.')[0]}.</p>

            {/* ── Colors ── */}
            {product.colors?.length > 0 && (
              <div className="color-section">
                <div className="color-section-header">
                  <span className="color-section-label">Couleur</span>
                  {selectedColor && (
                    <span className="selected-color-name">
                      <span className="color-dot-sm" style={{ background: selectedColor.hex_code }} />
                      {selectedColor.name}
                      <span className="color-stock-badge">
                        {selectedColor.stock > 0 ? `${selectedColor.stock} dispo` : 'Epuise'}
                      </span>
                    </span>
                  )}
                </div>
                <div className="color-swatches">
                  {product.colors.map(color => {
                    const oos = color.stock === 0
                    const sel = selectedColor?.id === color.id
                    return (
                      <button key={color.id}
                        className={`swatch-btn ${sel ? 'selected' : ''} ${oos ? 'out-of-stock' : ''}`}
                        onClick={() => !oos && setSelectedColor(color)}
                        title={`${color.name}${oos ? ' — Epuise' : ` (${color.stock} dispo)`}`}
                        disabled={oos}>
                        <span className="swatch-circle" style={{ background: color.hex_code }} />
                        {oos && <span className="swatch-cross">✕</span>}
                      </button>
                    )
                  })}
                </div>
                {colorError && <p className="color-error">⚠️ {colorError}</p>}
              </div>
            )}

            {/* ── Quantity ── */}
            {isInStock() && (
              <div className="qty-row">
                <span className="qty-label">Quantite</span>
                <div className="qty-control">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(getStockInfo() || 99, qty + 1))}>+</button>
                </div>
                <span className="stock-info">{getStockInfo()} en stock</span>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
  {/* زر الشراء المباشر بنفس ستايل زر السلة */}
              <button
                className="btn buy-now-btn"
                onClick={handleBuyNow}
                disabled={!isInStock()}
              >
                ⚡ Achetez maintenant
              </button>

              {/* زر إضافة للسلة */}
              <button
                className={`btn ${added ? 'btn-gold' : 'btn-primary'} add-cart-btn`}
                onClick={handleAdd}
                disabled={!isInStock()}
              >
                {added ? '✓ Ajoute au Panier !' : isInStock() ? 'Ajouter au Panier' : 'Epuise'}
              </button>
            </div>

            <div className="trust-badges">
              {[['🚚','Livraison partout en Algerie'],['📱','Confirmation par WhatsApp'],['📦','Emballage soigne']].map(([icon, text]) => (
                <div key={text} className="trust-item"><span>{icon}</span><span>{text}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="detail-tabs">
          <div className="tab-buttons">
            {['description','details','livraison'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'description' ? 'Description' : t === 'details' ? 'Details' : 'Livraison'}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {tab === 'description' && <p>{product.description}</p>}
          </div>
        </div>
      </div>
    </main>
  )
}