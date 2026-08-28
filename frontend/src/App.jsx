import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider }      from './context/CartContext'
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import ProtectedAdminRoute   from './admin/components/ProtectedAdminRoute'

// Client pages
import ScrollToTop from './components/ScrollToTop'
import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import Toast         from './components/Toast'
import Home          from './pages/Home'
import Shop          from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import Confirmation  from './pages/Confirmation'
import { About, Contact } from './pages/AboutContact'

// Admin pages
import AdminLogin      from './admin/pages/AdminLogin'
import AdminDashboard  from './admin/pages/AdminDashboard'
import AdminCommandes  from './admin/pages/AdminCommandes'
import AdminProduits   from './admin/pages/AdminProduits'
import AdminCategories from './admin/pages/AdminCategories'
import AdminShipping   from './admin/pages/AdminShipping'

function ClientApp() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/shop"             element={<Shop />} />
        <Route path="/product/:slug"    element={<ProductDetail />} />
        <Route path="/cart"             element={<Cart />} />
        <Route path="/checkout"         element={<Checkout />} />
        <Route path="/confirmation/:id" element={<Confirmation />} />
        <Route path="/about"            element={<About />} />
        <Route path="/contact"          element={<Contact />} />
        <Route path="*" element={
          <div className="empty-state" style={{ minHeight:'80vh', paddingTop:'var(--nav-h)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div className="icon">🔍</div>
            <h3>Page introuvable</h3>
            <a href="/" className="btn btn-primary">Accueil</a>
          </div>
        }/>
      </Routes>
      <Footer />
      <Toast />
    </CartProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login"     element={<AdminLogin />} />
          <Route path="/admin"           element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/commandes" element={<ProtectedAdminRoute><AdminCommandes /></ProtectedAdminRoute>} />
          <Route path="/admin/produits"  element={<ProtectedAdminRoute><AdminProduits /></ProtectedAdminRoute>} />
          <Route path="/admin/categories"element={<ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>} />
          <Route path="/admin/livraison" element={<ProtectedAdminRoute><AdminShipping /></ProtectedAdminRoute>} />
          <Route path="/*"               element={<ClientApp />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
