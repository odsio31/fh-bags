import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/admin` 
  : 'https://fh-bags.onrender.com/api/admin'

const ADMIN_API = axios.create({ baseURL: API_BASE_URL })

ADMIN_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!(config.data instanceof FormData)) config.headers['Content-Type'] = 'application/json'
  return config
})

ADMIN_API.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    window.location.href = '/admin/login'
  }
  return Promise.reject(err)
})

export const adminLogin      = (d)      => ADMIN_API.post('/login/', d)
export const adminStats      = ()       => ADMIN_API.get('/stats/')
export const adminCommandes  = (p)      => ADMIN_API.get('/commandes/', { params: p })
export const adminUpdateCmd  = (id, d)  => ADMIN_API.put(`/commandes/${id}/`, d)
export const adminDeleteCmd  = (id)     => ADMIN_API.delete(`/commandes/${id}/`)
export const adminProduits   = ()       => ADMIN_API.get('/produits/')
export const adminAddProduit = (fd)     => ADMIN_API.post('/produits/', fd)
export const adminEditProduit= (id, fd) => ADMIN_API.put(`/produits/${id}/`, fd)
export const adminDelProduit = (id)     => ADMIN_API.delete(`/produits/${id}/`)

// Images
export const adminGetImages  = (pid)            => ADMIN_API.get(`/produits/${pid}/images/`)
export const adminAddImage   = (pid, fd, cfg)   => ADMIN_API.post(`/produits/${pid}/images/`, fd, cfg)
export const adminSetMainImg = (pid, iid, d)    => ADMIN_API.patch(`/produits/${pid}/images/${iid}/`, d)
export const adminDelImage   = (pid, iid)       => ADMIN_API.delete(`/produits/${pid}/images/${iid}/`)

// Colors
export const adminGetColors  = (pid)            => ADMIN_API.get(`/produits/${pid}/colors/`)
export const adminAddColor   = (pid, d)         => ADMIN_API.post(`/produits/${pid}/colors/`, d)
export const adminEditColor  = (pid, cid, d)    => ADMIN_API.patch(`/produits/${pid}/colors/${cid}/`, d)
export const adminDelColor   = (pid, cid)       => ADMIN_API.delete(`/produits/${pid}/colors/${cid}/`)

// Categories
export const adminCategories = ()       => ADMIN_API.get('/categories/')
export const adminAddCat     = (d)      => ADMIN_API.post('/categories/', d)
export const adminEditCat    = (id, d)  => ADMIN_API.put(`/categories/${id}/`, d)
export const adminDelCat     = (id)     => ADMIN_API.delete(`/categories/${id}/`)

// Shipping
export const adminGetShipping    = ()         => ADMIN_API.get('/shipping/')
export const adminUpdateShipping = (id, data) => ADMIN_API.put(`/shipping/${id}/`, data)
export const adminAddShipping    = (data)      => ADMIN_API.post('/shipping/', data)
export const adminDelShipping    = (id)        => ADMIN_API.delete(`/shipping/${id}/`)

export default ADMIN_API