'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic' // <--- 1. IMPORTE O DYNAMIC DO NEXT
import { LoginForm } from '@/components/login-form'

// 2. IMPORTE O SEU DASHBOARD DESATIVANDO O SSR
const DashboardWithNoSSR = dynamic(
  () => import('@/components/dashboard').then((mod) => mod.Dashboard),
  { ssr: false }
)

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

  // 3. USE O COMPONENTE SEM SSR AQUI
  return <DashboardWithNoSSR onLogout={handleLogout} />
}