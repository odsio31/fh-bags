import { useCart } from '../context/CartContext'

export default function Toast() {
  const { toast } = useCart()
  if (!toast) return null
  return (
    <div className="toast">
      <span>🛍️</span>
      {toast}
    </div>
  )
}
