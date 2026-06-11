'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Expense, Payment } from '@/lib/types'
import { formatCurrency } from '@/lib/utils-format'
import { getTodayDateInputValue } from '@/lib/date-utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download, FileSpreadsheet, Banknote, CreditCard, Loader2, TrendingDown, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

const months = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Marco' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const startYear = 2026
const todayParts = getTodayDateInputValue().split('-')
const currentYear = Number(todayParts[0])
const years = Array.from(
  { length: Math.max(currentYear + 3, startYear + 3) - startYear + 1 },
  (_, i) => String(startYear + i)
)

export function ReportsView() {
  const [selectedMonth, setSelectedMonth] = useState(todayParts[1])
  const [selectedYear, setSelectedYear] = useState(todayParts[0])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [loadingType, setLoadingType] = useState<'full' | 'no-cash' | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadSummary = async () => {
      setSummaryLoading(true)
      try {
        const [paymentsRes, expensesRes] = await Promise.all([
          fetch(`/api/payments?month=${selectedMonth}&year=${selectedYear}`),
          fetch(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`)
        ])

        if (!paymentsRes.ok || !expensesRes.ok) {
          throw new Error('Falha ao carregar resumo do relatorio')
        }

        const [paymentsData, expensesData] = await Promise.all([
          paymentsRes.json(),
          expensesRes.json()
        ])

        if (isMounted) {
          setPayments(paymentsData)
          setExpenses(expensesData)
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar o resumo do relatorio.')
        if (isMounted) {
          setPayments([])
          setExpenses([])
        }
      } finally {
        if (isMounted) {
          setSummaryLoading(false)
        }
      }
    }

    loadSummary()

    return () => {
      isMounted = false
    }
  }, [selectedMonth, selectedYear])

  const summary = useMemo(() => {
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const noCashRevenue = payments
      .filter((payment) => payment.method !== 'cash')
      .reduce((sum, payment) => sum + payment.amount, 0)

    return {
      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses,
      noCashRevenue,
      noCashProfit: noCashRevenue - totalExpenses
    }
  }, [payments, expenses])

  const downloadFile = async (response: Response, filename: string) => {
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportReport = async (excludeCash: boolean) => {
    const payload = {
      month: selectedMonth,
      year: selectedYear,
      excludeCash,
      format: 'xlsx'
    }

    const response = await fetch('/api/reports/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao gerar relatorio')
    }

    const disposition = response.headers.get('content-disposition')
    const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? `relatorio-${selectedYear}-${selectedMonth}.xlsx`
    await downloadFile(response, filename)
  }

  const handleExportFull = async () => {
    setLoadingType('full')
    try {
      await exportReport(false)
      toast.success('Relatorio exportado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar relatorio completo.')
    } finally {
      setLoadingType(null)
    }
  }

  const handleExportNoCash = async () => {
    setLoadingType('no-cash')
    try {
      await exportReport(true)
      toast.success('Relatorio exportado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar relatorio sem dinheiro.')
    } finally {
      setLoadingType(null)
    }
  }

  const monthName = months.find(m => m.value === selectedMonth)?.label

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-zinc-800">Fechamento Mensal</CardTitle>
          <CardDescription>
            Selecione o periodo para exportar o relatorio financeiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-zinc-600">Mes</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-zinc-600">Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-zinc-800">Resumo Total de {monthName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryMetric
                icon={<Banknote className="h-5 w-5 text-emerald-600" />}
                label="Faturamento"
                value={summary.totalRevenue}
                colorClass="text-emerald-600"
                loading={summaryLoading}
              />
              <SummaryMetric
                icon={<TrendingDown className="h-5 w-5 text-red-500" />}
                label="Despesa"
                value={summary.totalExpenses}
                colorClass="text-red-500"
                loading={summaryLoading}
              />
              <SummaryMetric
                icon={<DollarSign className="h-5 w-5 text-zinc-700" />}
                label="Lucro"
                value={summary.totalProfit}
                colorClass={summary.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}
                loading={summaryLoading}
              />
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              {payments.length} pagamentos e {expenses.length} despesas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-zinc-800">Resumo Sem Dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryMetric
                icon={<CreditCard className="h-5 w-5 text-blue-600" />}
                label="Faturamento"
                value={summary.noCashRevenue}
                colorClass="text-blue-600"
                loading={summaryLoading}
              />
              <SummaryMetric
                icon={<TrendingDown className="h-5 w-5 text-red-500" />}
                label="Despesa"
                value={summary.totalExpenses}
                colorClass="text-red-500"
                loading={summaryLoading}
              />
              <SummaryMetric
                icon={<DollarSign className="h-5 w-5 text-zinc-700" />}
                label="Lucro"
                value={summary.noCashProfit}
                colorClass={summary.noCashProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}
                loading={summaryLoading}
              />
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Pix, cartao, boleto e outros metodos bancarios
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          className="cursor-pointer border-2 border-transparent bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
          onClick={loadingType ? undefined : handleExportFull}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 transition-colors group-hover:bg-emerald-200">
                <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-800">Exportar Relatorio Completo</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Gera o arquivo do mes com faturamento, despesas e resumo de lucro
                </p>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loadingType !== null}
                onClick={(event) => {
                  event.stopPropagation()
                  handleExportFull()
                }}
              >
                {loadingType === 'full' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar XLSX
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-2 border-transparent bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
          onClick={loadingType ? undefined : handleExportNoCash}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-800">Exportar Total Sem Dinheiro</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Gera o arquivo do mes sem pagamentos em especie, com despesas e resumo
                </p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loadingType !== null}
                onClick={(event) => {
                  event.stopPropagation()
                  handleExportNoCash()
                }}
              >
                {loadingType === 'no-cash' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar XLSX
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryMetric({
  icon,
  label,
  value,
  colorClass,
  loading
}: {
  icon: ReactNode
  label: string
  value: number
  colorClass: string
  loading: boolean
}) {
  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        {icon}
        {label}
      </div>
      <div className={`mt-2 break-words text-xl font-bold ${colorClass}`}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-400" /> : formatCurrency(value)}
      </div>
    </div>
  )
}
