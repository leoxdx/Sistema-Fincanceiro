'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/login-form'
import { Dashboard } from '@/components/dashboard'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedAuth = window.localStorage.getItem('isAuthenticated')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    window.localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('isAuthenticated')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}
