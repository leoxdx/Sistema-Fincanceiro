'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle, CalendarDays, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-format'
import { getTodayDateInputValue } from '@/lib/date-utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type DashboardRangeId = 'year' | '7' | '15' | '30' | '60' | '120' | '180' | '365'

interface DashboardSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyData: { month: string; receita: number; despesas: number }[]
}

interface DashboardViewProps {
  onQuickAction: (action: 'payment' | 'expense') => void
  onProcessing: (message: string, action: () => Promise<void> | void) => Promise<void>
}

const rangeOptions: { value: DashboardRangeId; label: string }[] = [
  { value: 'year', label: 'Ano atual' },
  { value: '7', label: '7 dias' },
  { value: '15', label: '15 dias' },
  { value: '30', label: '30 dias' },
  { value: '60', label: '60 dias' },
  { value: '120', label: '120 dias' },
  { value: '180', label: '180 dias' },
  { value: '365', label: '1 ano' },
]

const emptySummary: DashboardSummary = {
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  monthlyData: []
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRangeDates(rangeId: DashboardRangeId) {
  const today = new Date()

  if (rangeId === 'year') {
    const year = getTodayDateInputValue(today).slice(0, 4)
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    }
  }

  const days = Number(rangeId)
  const start = new Date(today)
  start.setDate(start.getDate() - (days - 1))

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(today)
  }
}

export function DashboardView({ onQuickAction, onProcessing }: DashboardViewProps) {
  const [selectedRange, setSelectedRange] = useState<DashboardRangeId>('year')
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary)
  const [loading, setLoading] = useState(true)

  const selectedRangeLabel = useMemo(
    () => rangeOptions.find((option) => option.value === selectedRange)?.label ?? 'Periodo',
    [selectedRange]
  )

  const loadDashboard = async (rangeId: DashboardRangeId) => {
    const { start, end } = getRangeDates(rangeId)
    const response = await fetch(`/api/dashboard?start=${start}&end=${end}`)
    if (!response.ok) {
      throw new Error('Falha ao carregar painel')
    }
    const data = await response.json()
    setSummary(data)
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialDashboard = async () => {
      setLoading(true)
      try {
        const { start, end } = getRangeDates('year')
        const response = await fetch(`/api/dashboard?start=${start}&end=${end}`)
        if (!response.ok) {
          throw new Error('Falha ao carregar painel')
        }
        const data = await response.json()
        if (isMounted) {
          setSummary(data)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInitialDashboard().catch((error) => {
      console.error(error)
      if (isMounted) {
        setSummary(emptySummary)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleRangeChange = async (rangeId: DashboardRangeId) => {
    setSelectedRange(rangeId)
    await onProcessing('Atualizando painel...', async () => {
      await loadDashboard(rangeId)
    }).catch((error) => {
      console.error(error)
      setSummary(emptySummary)
    })
  }

  const totalRevenue = summary.totalRevenue
  const totalExpenses = summary.totalExpenses
  const netProfit = summary.netProfit
  const isProfit = netProfit >= 0

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                <CalendarDays className="h-4 w-4 text-primary" />
                Periodo do painel
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Resumo financeiro consolidado
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end">
              {rangeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={selectedRange === option.value ? 'default' : 'outline'}
                  onClick={() => handleRangeChange(option.value)}
                  className={selectedRange === option.value ? 'bg-primary hover:bg-primary/90' : 'bg-white'}
                  disabled={loading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
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
            {loading ? (
              <div className="flex h-[260px] items-center justify-center gap-2 text-center text-zinc-500 sm:h-[300px]">
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando painel...
              </div>
            ) : summary.monthlyData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-center text-zinc-500 sm:h-[300px]">
                Nenhum dado para o periodo selecionado.
              </div>
            ) : (
              <div className="h-[260px] min-w-0 sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthlyData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={(value) => `R$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `${label} - ${selectedRangeLabel}`}
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
