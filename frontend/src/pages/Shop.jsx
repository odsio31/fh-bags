import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/ProductCard'
import './Shop.css'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [total, setTotal]               = useState(0)
  const [search, setSearch]             = useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [ordering, setOrdering]         = useState('-created_at')
  const [priceMax, setPriceMax]         = useState('')

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.results || data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {
      ordering,
      ...(activeCategory && { 'category__slug': activeCategory }),
      ...(search         && { search }),
    }
    getProducts(params)
      .then(({ data }) => {
        let results = data.results || data
        if (priceMax) results = results.filter(p => parseFloat(p.price) <= parseFloat(priceMax))
        setProducts(results)
        setTotal(data.count || results.length)
      })
      .finally(() => setLoading(false))
  }, [activeCategory, ordering, search, priceMax])

  const handleCategory = (slug) => {
    setActiveCategory(slug)
    const params = {}
    if (slug)   params.category = slug
    if (search) params.search   = search
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (activeCategory) params.category = activeCategory
    if (search)         params.search   = search
    setSearchParams(params)
  }

  const clearFilters = () => {
    setActiveCategory('')
    setSearch('')
    setPriceMax('')
    setOrdering('-created_at')
    setSearchParams({})
  }

  return (
    <main className="shop-page page-enter" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="shop-header">
        <div className="container">
          <span className="eyebrow">F&amp;H Bags</span>
          <h1>Notre Collection</h1>
          <div className="divider" />
          <p>{total} {total <= 1 ? 'article' : 'articles'} trouve{total > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="shop-layout container">
        <aside className="sidebar">
          <div className="filter-group">
            <h4>Recherche</h4>
            <form onSubmit={handleSearch} className="search-form">
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary search-btn">→</button>
            </form>
          </div>

          <div className="filter-group">
            <h4>Categorie</h4>
            <ul className="filter-list">
              <li>
                <button className={`filter-item ${activeCategory === '' ? 'active' : ''}`} onClick={() => handleCategory('')}>
                  Tous les Sacs
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button className={`filter-item ${activeCategory === cat.slug ? 'active' : ''}`} onClick={() => handleCategory(cat.slug)}>
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {(activeCategory || search || priceMax) && (
            <button className="btn btn-outline clear-btn" onClick={clearFilters}>
              Effacer les Filtres
            </button>
          )}
        </aside>

        <div className="products-area">
          <div className="toolbar">
            <span className="count-label">{total} produits</span>
            <div className="sort-wrap">
              <label>Trier par :</label>
              <select value={ordering} onChange={e => setOrdering(e.target.value)}>
                <option value="-created_at">Plus Recents</option>
                <option value="price">Prix : Croissant</option>
                <option value="-price">Prix : Decroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">👜</div>
              <h3>Aucun sac trouve</h3>
              <p>Essayez d'ajuster vos filtres ou votre recherche.</p>
              <button className="btn btn-outline" onClick={clearFilters}>Effacer les Filtres</button>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
