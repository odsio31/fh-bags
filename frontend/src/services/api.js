import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Products ──────────────────────────────────────────────────────────────
export const getProducts   = (params) => API.get('/products/', { params })
export const getProduct    = (slug)   => API.get(`/products/${slug}/`)
export const getFeatured   = ()       => API.get('/products/featured/')
export const getCategories = ()       => API.get('/products/categories/')

// ── Orders ────────────────────────────────────────────────────────────────
export const createOrder = (data) => API.post('/orders/', data)
export const getOrder    = (id)   => API.get(`/orders/${id}/`)

export default API

export const getShippingRates = () => API.get('/shipping/')
