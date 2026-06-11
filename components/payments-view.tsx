'use client'

import { useState } from 'react'
import { Payment, PaymentMethod } from '@/lib/types'
import { formatCurrency, formatDate, getPaymentMethodLabel, getPaymentMethodColor } from '@/lib/utils-format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { PaymentModal } from './payment-modal'

interface PaymentsViewProps {
  payments: Payment[]
  onAddPayment: (payment: Omit<Payment, 'id'>) => Promise<void>
  onEditPayment: (payment: Payment) => Promise<void>
  onDeletePayment: (id: string) => Promise<void>
  onFilterChange: (month: string, year: string) => Promise<void>
  currentMonth: string
  currentYear: string
}

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
const years = Array.from({ length: 4 }, (_, i) => String(startYear + i))

export function PaymentsView({ payments, onAddPayment, onEditPayment, onDeletePayment, onFilterChange, currentMonth, currentYear }: PaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterLoading, setFilterLoading] = useState(false)

  const filteredPayments = payments.filter(payment =>
    payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.patientCpf.includes(searchTerm)
  )

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPayment(null)
  }

  const handleSave = async (data: { patientName: string; patientCpf: string; amount: number; method: PaymentMethod; date: string }) => {
    if (editingPayment) {
      await onEditPayment({
        ...editingPayment,
        ...data
      })
    } else {
      await onAddPayment({
        patientId: Date.now().toString(),
        ...data
      })
    }
    handleModalClose()
  }

  const handleFilterChange = async (month: string, year: string) => {
    setFilterLoading(true)
    try {
      await onFilterChange(month, year)
    } finally {
      setFilterLoading(false)
    }
  }

  const totalPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-zinc-600">Mes</Label>
              <Select value={currentMonth} disabled={filterLoading} onValueChange={(month) => handleFilterChange(month, currentYear)}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Selecione o mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-zinc-600">Ano</Label>
              <Select value={currentYear} disabled={filterLoading} onValueChange={(year) => handleFilterChange(currentMonth, year)}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2 rounded-md bg-emerald-50 p-3 sm:bg-transparent sm:p-0">
              <Label className="text-sm text-zinc-600">Total do Periodo</Label>
              <div className="break-words text-xl font-bold text-emerald-600 sm:text-2xl">{formatCurrency(totalPayments)}</div>
            </div>
          </div>
          {filterLoading && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              Atualizando dados do banco...
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-zinc-800">Pacientes</CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Pagamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="bg-zinc-50 pl-10 border-zinc-200 focus-visible:ring-primary"
            />
          </div>

          <div className={`space-y-3 md:hidden ${filterLoading ? 'opacity-55' : ''}`}>
            {filterLoading ? (
              <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-500">
                Carregando pagamentos...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-500">
                Nenhum pagamento encontrado
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-zinc-800">{payment.patientName}</p>
                      <p className="mt-1 break-all text-xs text-zinc-500">{payment.patientCpf || 'CPF nao informado'}</p>
                    </div>
                    <Badge className={`${getPaymentMethodColor(payment.method)} shrink-0 border-0 font-medium`}>
                      {getPaymentMethodLabel(payment.method)}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500">Valor Pago</p>
                      <p className="break-words font-semibold text-emerald-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Data</p>
                      <p className="font-medium text-zinc-700">{formatDate(payment.date)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(payment)}
                      className="text-zinc-600 hover:text-primary"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(payment.id)}
                      className="text-zinc-600 hover:text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={`hidden rounded-lg border border-zinc-200 md:block md:overflow-hidden ${filterLoading ? 'opacity-55' : ''}`}>
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="font-semibold text-zinc-700">Paciente</TableHead>
                  <TableHead className="font-semibold text-zinc-700">CPF</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Valor Pago</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Metodo</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Data</TableHead>
                  <TableHead className="text-right font-semibold text-zinc-700">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-zinc-500">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="transition-colors hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-800">{payment.patientName}</TableCell>
                      <TableCell className="text-sm text-zinc-600">{payment.patientCpf || 'CPF nao informado'}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${getPaymentMethodColor(payment.method)} border-0 font-medium`}>
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-600">{formatDate(payment.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(payment)}
                            className="h-8 w-8 text-zinc-500 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(payment.id)}
                            className="h-8 w-8 text-zinc-500 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        initialData={editingPayment}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  if (deleteId) {
                    await onDeletePayment(deleteId)
                  }
                  setDeleteId(null)
                } catch {
                  // Error toast is handled by the parent action.
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
