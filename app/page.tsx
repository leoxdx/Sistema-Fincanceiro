'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/login-form'
import { Dashboard } from '@/components/dashboard'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  return <Dashboard />
}
