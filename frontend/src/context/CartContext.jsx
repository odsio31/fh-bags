import { createContext, useContext, useState, useEffect } from 'react'

const CartContext  = createContext(null)
const STORAGE_KEY  = 'fhbags_cart'

function loadCart()       { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : [] } catch { return [] } }
function saveCart(items)  { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [toast, setToast] = useState(null)

  useEffect(() => { saveCart(items) }, [items])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // Generate unique key per product+color combination
  const itemKey = (productId, color) => color ? `${productId}-${color.id}` : `${productId}`

  const addItem = (product, quantity = 1, color = null) => {
    setItems(prev => {
      const key      = itemKey(product.id, color)
      const existing = prev.find(i => i.key === key)
      if (existing) {
        showToast('Quantite mise a jour ✓')
        return prev.map(i => i.key === key
          ? { ...i, quantity: Math.min(i.quantity + quantity, color?.stock || product.stock || 99) }
          : i
        )
      }
      showToast('Ajoute au panier ✓')
      return [...prev, {
        key,
        id:          product.id,
        slug:        product.slug,
        name:        product.name,
        price:       parseFloat(product.price),
        image:       product.images?.[0]?.url || product.image || product.image_url || '',
        stock:       color?.stock || product.stock || 99,
        quantity,
        color_name:  color?.name  || '',
        color_hex:   color?.hex_code || '',
      }]
    })
  }

  const updateItem = (key, quantity) => {
    if (quantity < 1) return removeItem(key)
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i))
  }

  const removeItem = (key) => {
    setItems(prev => prev.filter(i => i.key !== key))
    showToast('Article retire.')
  }

  const clearCart  = () => setItems([])
  const itemCount  = items.reduce((s, i) => s + i.quantity, 0)
  const sousTotal  = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, sousTotal, toast, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
