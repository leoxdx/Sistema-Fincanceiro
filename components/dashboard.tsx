'use client'

import { useState, useEffect } from 'react'
import { View, Payment, Expense } from '@/lib/types'
import { Sidebar } from './sidebar'
import { DashboardView } from './dashboard-view'
import { PaymentsView } from './payments-view'
import { ExpensesView } from './expenses-view'
import { ReportsView } from './reports-view'
import { toast } from 'sonner'

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [currentYear, setCurrentYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const month = String(new Date().getMonth() + 1).padStart(2, '0')
        const year = String(new Date().getFullYear())
        
        const [paymentsRes, expensesRes] = await Promise.all([
          fetch(`/api/payments?month=${month}&year=${year}`),
          fetch(`/api/expenses?month=${month}&year=${year}`)
        ])

        if (!paymentsRes.ok || !expensesRes.ok) {
          throw new Error('Falha ao carregar dados do backend')
        }

        const [paymentsData, expensesData] = await Promise.all([
          paymentsRes.json(),
          expensesRes.json()
        ])

        setPayments(paymentsData)
        setExpenses(expensesData)
        setCurrentMonth(month)
        setCurrentYear(year)
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível carregar os dados do backend.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleAddPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      })

      if (!response.ok) {
        throw new Error('Não foi possível salvar o pagamento')
      }

      const newPayment = await response.json()
      setPayments((current) => [newPayment, ...current])
      toast.success('Pagamento salvo com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar o pagamento.')
    }
  }

  const handleEditPayment = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: payment.patientName,
          patientCpf: payment.patientCpf,
          amount: payment.amount,
          method: payment.method,
          date: payment.date
        })
      })

      if (!response.ok) {
        throw new Error('Não foi possível atualizar o pagamento')
      }

      const updatedPayment = await response.json()
      setPayments((current) => current.map((item) => item.id === updatedPayment.id ? updatedPayment : item))
      toast.success('Pagamento atualizado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar o pagamento.')
    }
  }

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Não foi possível excluir o pagamento')
      }

      setPayments((current) => current.filter((payment) => payment.id !== id))
      toast.success('Pagamento excluído com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir o pagamento.')
    }
  }

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      })

      if (!response.ok) {
        throw new Error('Não foi possível salvar a despesa')
      }

      const newExpense = await response.json()
      setExpenses((current) => [newExpense, ...current])
      toast.success('Despesa salva com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar a despesa.')
    }
  }

  const handleEditExpense = async (expense: Expense) => {
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expense.description,
          amount: expense.amount,
          date: expense.date
        })
      })

      if (!response.ok) {
        throw new Error('Não foi possível atualizar a despesa')
      }

      const updatedExpense = await response.json()
      setExpenses((current) => current.map((item) => item.id === updatedExpense.id ? updatedExpense : item))
      toast.success('Despesa atualizada com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar a despesa.')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Não foi possível excluir a despesa')
      }

      setExpenses((current) => current.filter((expense) => expense.id !== id))
      toast.success('Despesa excluída com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir a despesa.')
    }
  }

  const handlePaymentFilter = async (month: string, year: string) => {
    try {
      const response = await fetch(`/api/payments?month=${month}&year=${year}`)
      if (!response.ok) throw new Error('Falha ao carregar pagamentos')
      const data = await response.json()
      setPayments(data)
      setCurrentMonth(month)
      setCurrentYear(year)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar pagamentos.')
    }
  }

  const handleExpenseFilter = async (month: string, year: string) => {
    try {
      const response = await fetch(`/api/expenses?month=${month}&year=${year}`)
      if (!response.ok) throw new Error('Falha ao carregar despesas')
      const data = await response.json()
      setExpenses(data)
      setCurrentMonth(month)
      setCurrentYear(year)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar despesas.')
    }
  }

  const handleQuickAction = (action: 'payment' | 'expense') => {
    if (action === 'payment') {
      setCurrentView('payments')
    } else {
      setCurrentView('expenses')
    }
  }

  const handleLogout = () => {
    onLogout()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-800">
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'payments' && 'Pacientes'}
              {currentView === 'expenses' && 'Lançar Despesa'}
              {currentView === 'reports' && 'Exportar Relatórios'}
            </h1>
            <p className="text-zinc-500 mt-1">
              {currentView === 'dashboard' && 'Visão geral do seu consultório'}
              {currentView === 'payments' && 'Gerencie os pagamentos dos pacientes'}
              {currentView === 'expenses' && 'Registre as despesas do consultório'}
              {currentView === 'reports' && 'Exporte relatórios para análise'}
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-zinc-600 shadow-sm">
              Carregando dados do sistema...
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  payments={payments}
                  expenses={expenses}
                  onQuickAction={handleQuickAction}
                />
              )}
              {currentView === 'payments' && (
                <PaymentsView
                  payments={payments}
                  onAddPayment={handleAddPayment}
                  onEditPayment={handleEditPayment}
                  onDeletePayment={handleDeletePayment}
                  onFilterChange={handlePaymentFilter}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                />
              )}
              {currentView === 'expenses' && (
                <ExpensesView
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onFilterChange={handleExpenseFilter}
                />
              )}
              {currentView === 'reports' && (
                <ReportsView payments={payments} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
