import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFeatured } from '../services/api'
import ProductCard from '../components/ProductCard'
import './Home.css'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getFeatured()
      .then(({ data }) => setFeatured(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="home page-enter">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <span className="eyebrow-tag">Nouvelle Collection </span>
          <h1>Cree pour<br /><em>Son Histoire</em></h1>
          <p>Sacs en cuir premium alliant elegance intemporelle et fonctionnalite quotidienne. Chaque piece est une oeuvre d'art.</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">Voir la Collection</Link>
            <Link to="/about" className="btn btn-outline hero-outline">Notre Histoire</Link>
          </div>
          <div className="hero-delivery-badges">
            <span>🚚 Livraison partout en Algerie</span>
            <span>📱 Confirmation WhatsApp</span>
            <span>📦 Yallidine </span>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85" alt="F&H Bags" />
          <div className="hero-float-tag">
            <span>Fait Main</span>
            <strong>Cuir Premium</strong>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Defiler</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {['Cuir Pleine Fleur', 'Design Intemporel', 'Qualite Premium', 'Livraison Partout en Algerie', 'Yallidine 370 DA', 'Domicile 600 DA', 'Confirmation WhatsApp', 'Cuir Pleine Fleur', 'Design Intemporel', 'Qualite Premium', 'Livraison Partout en Algerie', 'Yallidine 370 DA'].map((t, i) => (
            <span key={i}>{t} <span className="dot">◆</span></span>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Parcourir par Style</span>
            <h2>Nos Collections</h2>
            <div className="divider" />
          </div>
          <div className="categories-grid">
            {[
              { slug: 'tote-bags',      label: 'Sacs Tote',        img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80' },
              { slug: 'clutch-bags',    label: 'Pochettes',         img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80' },
              { slug: 'crossbody-bags', label: 'Sacs Bandouliere',  img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
              { slug: 'backpacks',      label: 'Sacs a Dos',        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
            ].map(cat => (
              <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="category-card">
                <div className="cat-img-wrap">
                  <img src={cat.img} alt={cat.label} loading="lazy" />
                </div>
                <div className="cat-label">
                  <span>{cat.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produits Vedettes ── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Selectionnes pour Vous</span>
            <h2>Pieces Vedettes</h2>
            <div className="divider" />
            <p>Nos styles les plus aimes — selectionnes pour leur savoir-faire et leur polyvalence.</p>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn btn-outline">Voir Tous les Produits</Link>
          </div>
        </div>
      </section>

      {/* ── Pourquoi F&H ── */}
      <section className="section why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-text">
              <span className="eyebrow">Pourquoi F&amp;H Bags</span>
              <h2>Plus qu'un Sac —<br /><em>Un Art de Vivre</em></h2>
              <div className="divider" style={{ margin: '1.2rem 0' }} />
              <p>Chaque sac F&H est ne d'une passion pour la qualite. Nous selectionnons les meilleurs cuirs et collaborons avec des artisans pour creer des pieces parfaites.</p>
              <ul className="why-list">
                {[
                  'Cuir pleine fleur premium',
                  'Coutures faites a la main',
                  'Garantie qualite a vie',
                  'Livraison partout en Algerie',
                ].map(item => (
                  <li key={item}><span className="check">✓</span> {item}</li>
                ))}
              </ul>
              <Link to="/about" className="btn btn-primary" style={{ marginTop: '2rem' }}>En Savoir Plus</Link>
            </div>
            <div className="why-image">
              <img src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=85" alt="Artisanat" />
              <div className="why-badge">
                <span className="badge-number">100%</span>
                <span className="badge-label">Cuir Veritable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comment Commander ── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Simple et Rapide</span>
            <h2>Comment Commander ?</h2>
            <div className="divider" />
          </div>
          <div className="steps-grid">
            {[
              { num: '01', icon: '🛍️', title: 'Choisissez votre sac',   text: 'Parcourez notre collection et ajoutez vos articles au panier.' },
              { num: '02', icon: '📋', title: 'Remplissez le formulaire', text: 'Entrez vos coordonnees et choisissez votre mode de livraison.' },
              { num: '03', icon: '✅', title: 'Confirmez la commande',    text: 'Cliquez sur Commander. Nous vous contactons sur WhatsApp.' },
              { num: '04', icon: '📦', title: 'Recevez votre colis',      text: 'Livraison a domicile ou en bureau Yallidine sous 1-5 jours.' },
            ].map(s => (
              <div key={s.num} className="step-card">
                <span className="step-num-badge">{s.num}</span>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="cta-content container">
          <h2>Livraison Yallidine </h2>
          <p>Livraison rapide et securisee partout en Algerie. Confirmation par WhatsApp garantie.</p>
          <Link to="/shop" className="btn btn-gold">Commander Maintenant</Link>
        </div>
      </section>

    </main>
  )
}
