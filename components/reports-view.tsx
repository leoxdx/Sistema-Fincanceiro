'use client'

import { useState } from 'react'
import { Payment } from '@/lib/types'
import { formatCurrency } from '@/lib/utils-format'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download, FileSpreadsheet, Banknote, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReportsViewProps {
  payments: Payment[]
}

const months = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
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
const years = Array.from({ length: 4 }, (_, i) => String(startYear + i))

export function ReportsView({ payments }: ReportsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState('01')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [loadingType, setLoadingType] = useState<'full' | 'no-cash' | null>(null)

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date)
    return (
      paymentDate.getMonth() + 1 === parseInt(selectedMonth) &&
      paymentDate.getFullYear() === parseInt(selectedYear)
    )
  })

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalWithoutCash = filteredPayments
    .filter(p => p.method !== 'cash')
    .reduce((sum, p) => sum + p.amount, 0)

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
      throw new Error(errorData.message || 'Erro ao gerar relatório')
    }

    const disposition = response.headers.get('content-disposition')
    const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? `relatorio-${selectedYear}-${selectedMonth}.csv`
    await downloadFile(response, filename)
  }

  const handleExportFull = async () => {
    setLoadingType('full')
    try {
      await exportReport(false)
      toast.success('Relatório exportado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar relatório completo.')
    } finally {
      setLoadingType(null)
    }
  }

  const handleExportNoCash = async () => {
    setLoadingType('no-cash')
    try {
      await exportReport(true)
      toast.success('Relatório exportado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar relatório sem dinheiro.')
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
            Selecione o período para exportar o relatório financeiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-zinc-600 text-sm">Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o mês" />
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
            <div className="flex-1 space-y-2">
              <Label className="text-zinc-600 text-sm">Ano</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Banknote className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total Recebido em {monthName}</p>
                <p className="text-2xl font-bold text-zinc-800">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-zinc-400">{filteredPayments.length} pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total sem Dinheiro</p>
                <p className="text-2xl font-bold text-zinc-800">{formatCurrency(totalWithoutCash)}</p>
                <p className="text-xs text-zinc-400">Apenas métodos digitais/bancários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-emerald-200 group"
          onClick={loadingType ? undefined : handleExportFull}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800">Exportar Relatório Completo</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Gera o arquivo do mês com faturamento, despesas e resumo de lucro
                </p>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loadingType !== null}
                onClick={(e) => {
                  e.stopPropagation()
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
          className="bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-200 group"
          onClick={loadingType ? undefined : handleExportNoCash}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800">Exportar Total Sem Dinheiro</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Gera o arquivo do mês sem pagamentos em espécie, com despesas e resumo
                </p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loadingType !== null}
                onClick={(e) => {
                  e.stopPropagation()
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
