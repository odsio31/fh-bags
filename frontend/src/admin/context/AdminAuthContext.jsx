import { createContext, useContext, useState } from 'react'
import { adminLogin } from '../services/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (credentials) => {
    const { data } = await adminLogin(credentials)
    localStorage.setItem('admin_token', data.access)
    localStorage.setItem('admin_user', JSON.stringify({ username: data.username }))
    setAdmin({ username: data.username })
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
