import React, { createContext, useState, useEffect } from 'react'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedHandle = localStorage.getItem('cf_handle')
    if (savedHandle) {
      setUser({ handle: savedHandle })
    }
    setLoading(false)
  }, [])

  const login = (handle) => {
    setUser({ handle })
    localStorage.setItem('cf_handle', handle)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cf_handle')
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = React.useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
