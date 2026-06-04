'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DateInput } from '@/components/ui/date-input'
import { TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-format'
import { getDateOnlyMonthIndex } from '@/lib/date-utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Payment, Expense } from '@/lib/types'

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

interface DashboardViewProps {
  payments: Payment[]
  expenses: Expense[]
  onQuickAction: (action: 'payment' | 'expense') => void
  onProcessing: (message: string, action: () => Promise<void> | void) => Promise<void>
}

export function DashboardView({ payments, expenses, onQuickAction, onProcessing }: DashboardViewProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const hasDateFilter = appliedStartDate !== '' && appliedEndDate !== ''

  const handleFilter = async () => {
    await onProcessing('Filtrando painel...', () => {
      setAppliedStartDate(startDate)
      setAppliedEndDate(endDate)
    })
  }

  const filteredPayments = useMemo(
    () => payments.filter((payment) => {
      if (!hasDateFilter) return true
      return payment.date >= appliedStartDate && payment.date <= appliedEndDate
    }),
    [payments, hasDateFilter, appliedStartDate, appliedEndDate]
  )

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => {
      if (!hasDateFilter) return true
      return expense.date >= appliedStartDate && expense.date <= appliedEndDate
    }),
    [expenses, hasDateFilter, appliedStartDate, appliedEndDate]
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
      const month = monthNames[getDateOnlyMonthIndex(payment.date)]
      const current = monthlyMap.get(month) || { month, receita: 0, despesas: 0 }
      monthlyMap.set(month, { ...current, receita: current.receita + payment.amount })
    })

    filteredExpenses.forEach((expense) => {
      const month = monthNames[getDateOnlyMonthIndex(expense.date)]
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
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="startDate" className="text-sm text-zinc-600">Data Inicio</Label>
              <DateInput
                id="startDate"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-white"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="endDate" className="text-sm text-zinc-600">Data Fim</Label>
              <DateInput
                id="endDate"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-white"
              />
            </div>
            <Button type="button" onClick={handleFilter} className="w-full bg-primary hover:bg-primary/90 sm:w-auto">
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">Receita Gerada</p>
                <p className="break-words text-xl font-bold text-emerald-600 sm:text-2xl">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">Despesas Totais</p>
                <p className="break-words text-xl font-bold text-red-500 sm:text-2xl">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">Lucro Liquido</p>
                <p className={`break-words text-xl font-bold sm:text-2xl ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className={`ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isProfit ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${isProfit ? 'text-emerald-600' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-white shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-800">Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {monthlyData.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-center text-zinc-500">
                Nenhum dado para o periodo selecionado.
              </div>
            ) : (
              <div className="h-[260px] min-w-0 sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="18%">
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
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-zinc-800">Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => onQuickAction('payment')}
              className="w-full min-w-0 justify-start gap-3 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              variant="outline"
            >
              <PlusCircle className="h-5 w-5 shrink-0" />
              <span className="truncate">Lancar Pagamento</span>
            </Button>
            <Button
              onClick={() => onQuickAction('expense')}
              className="w-full min-w-0 justify-start gap-3 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              variant="outline"
            >
              <MinusCircle className="h-5 w-5 shrink-0" />
              <span className="truncate">Lancar Despesa</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
