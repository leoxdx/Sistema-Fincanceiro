'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Payment, Expense } from '@/lib/types'

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

interface DashboardViewProps {
  payments: Payment[]
  expenses: Expense[]
  onQuickAction: (action: 'payment' | 'expense') => void
}

export function DashboardView({ payments, expenses, onQuickAction }: DashboardViewProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const hasDateFilter = startDate !== '' && endDate !== ''
  const start = hasDateFilter ? new Date(startDate) : null
  const end = hasDateFilter ? new Date(endDate) : null

  const filteredPayments = useMemo(
    () => payments.filter((payment) => {
      if (!hasDateFilter) return true
      const paymentDate = new Date(payment.date)
      return paymentDate >= start! && paymentDate <= end!
    }),
    [payments, hasDateFilter, startDate, endDate]
  )

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => {
      if (!hasDateFilter) return true
      const expenseDate = new Date(expense.date)
      return expenseDate >= start! && expenseDate <= end!
    }),
    [expenses, hasDateFilter, startDate, endDate]
  )

  const totalRevenue = useMemo(
    () => filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
    [filteredPayments]
  )

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  )

  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, { month: string; receita: number; despesas: number }>()

    filteredPayments.forEach((payment) => {
      const month = monthNames[new Date(payment.date).getMonth()]
      const current = monthlyMap.get(month) || { month, receita: 0, despesas: 0 }
      monthlyMap.set(month, { ...current, receita: current.receita + payment.amount })
    })

    filteredExpenses.forEach((expense) => {
      const month = monthNames[new Date(expense.date).getMonth()]
      const current = monthlyMap.get(month) || { month, receita: 0, despesas: 0 }
      monthlyMap.set(month, { ...current, despesas: current.despesas + expense.amount })
    })

    return Array.from(monthlyMap.values()).sort(
      (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
    )
  }, [filteredPayments, filteredExpenses])

  const netProfit = totalRevenue - totalExpenses
  const isProfit = netProfit >= 0

  return (

    <div className="space-y-6">
      {/* Filter Bar */}
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate" className="text-zinc-600 text-sm">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="endDate" className="text-zinc-600 text-sm">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button type="button" className="bg-primary hover:bg-primary/90">
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Receita Gerada</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isProfit ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${isProfit ? 'text-emerald-600' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-zinc-800">Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-zinc-800">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onQuickAction('payment')}
              className="w-full justify-start gap-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              variant="outline"
            >
              <PlusCircle className="h-5 w-5" />
              Lançar Pagamento
            </Button>
            <Button 
              onClick={() => onQuickAction('expense')}
              className="w-full justify-start gap-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              variant="outline"
            >
              <MinusCircle className="h-5 w-5" />
              Lançar Despesa
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
