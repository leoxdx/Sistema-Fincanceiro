'use client'

import { useState } from 'react'
import { Expense } from '@/lib/types'
import { parseCurrencyAmount, validateTransactionAmount } from '@/lib/amount'
import { getTodayDateInputValue } from '@/lib/date-utils'
import { formatCurrency, formatDate } from '@/lib/utils-format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateInput } from '@/components/ui/date-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Save, Pencil, Trash2 } from 'lucide-react'
import { ExpenseModal } from './expense-modal'

interface ExpensesViewProps {
  expenses: Expense[]
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
  onEditExpense: (expense: Expense) => Promise<void>
  onDeleteExpense: (id: string) => Promise<void>
  onFilterChange: (month: string, year: string) => Promise<void>
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
const todayParts = getTodayDateInputValue().split('-')

export function ExpensesView({ expenses, onAddExpense, onEditExpense, onDeleteExpense, onFilterChange }: ExpensesViewProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getTodayDateInputValue())
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterLoading, setFilterLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(todayParts[1])
  const [selectedYear, setSelectedYear] = useState(todayParts[0])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!description.trim()) newErrors.description = 'Descricao e obrigatoria'
    if (!amount.trim()) newErrors.amount = 'Valor e obrigatorio'
    else {
      const amountError = validateTransactionAmount(amount)
      if (amountError) newErrors.amount = amountError
    }
    if (!date) newErrors.date = 'Data e obrigatoria'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const parsedAmount = parseCurrencyAmount(amount)
      if (parsedAmount === null) return

      await onAddExpense({
        description,
        amount: parsedAmount,
        date
      })

      setDescription('')
      setAmount('')
      setDate(getTodayDateInputValue())
      setErrors({})
    } catch {
      // Error toast is handled by the parent action.
    } finally {
      setLoading(false)
    }
  }

  const handleModalSave = async (data: { description: string; amount: number; date: string }) => {
    if (editingExpense) {
      await onEditExpense({
        ...editingExpense,
        ...data
      })
    } else {
      await onAddExpense(data)
    }
    setIsModalOpen(false)
  }

  const handleFilterChange = async (month: string, year: string) => {
    setFilterLoading(true)
    try {
      await onFilterChange(month, year)
      setSelectedMonth(month)
      setSelectedYear(year)
    } finally {
      setFilterLoading(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-zinc-600">Mes</Label>
              <Select value={selectedMonth} disabled={filterLoading} onValueChange={(month) => handleFilterChange(month, selectedYear)}>
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
              <Select value={selectedYear} disabled={filterLoading} onValueChange={(year) => handleFilterChange(selectedMonth, year)}>
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
            <div className="min-w-0 space-y-2 rounded-md bg-red-50 p-3 sm:bg-transparent sm:p-0">
              <Label className="text-sm text-zinc-600">Total do Periodo</Label>
              <div className="break-words text-xl font-bold text-red-600 sm:text-2xl">{formatCurrency(totalExpenses)}</div>
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
        <CardHeader>
          <CardTitle className="text-zinc-800">Lancar Nova Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="description" className="text-zinc-700">
                  Prestador do Servico / Descricao
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: Funcionario, Boleto Dental, Conta de Luz"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`bg-zinc-50 ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="expenseAmount" className="text-zinc-700">Valor (R$)</Label>
                <Input
                  id="expenseAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className={`bg-zinc-50 ${errors.amount ? 'border-red-500' : ''}`}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="expenseDate" className="text-zinc-700">Data do Vencimento/Pagamento</Label>
                <DateInput
                  id="expenseDate"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={`bg-zinc-50 ${errors.date ? 'border-red-500' : ''}`}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Despesa
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-zinc-800">Despesas do Periodo</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className={`md:hidden ${filterLoading ? 'opacity-55' : ''}`}>
            {filterLoading ? (
              <div className="rounded-md border border-zinc-200 p-5 text-center text-sm text-zinc-500">
                Carregando despesas...
              </div>
            ) : expenses.length === 0 ? (
              <div className="rounded-md border border-zinc-200 p-5 text-center text-sm text-zinc-500">
                Nenhuma despesa neste periodo
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-zinc-200">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-3 border-b border-zinc-100 bg-white px-3 py-3 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-800">{expense.description}</p>
                      <p className="mt-1 text-xs text-zinc-500">{formatDate(expense.date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-red-500">{formatCurrency(expense.amount)}</p>
                      <div className="mt-2 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar despesa"
                          onClick={() => handleEdit(expense)}
                          className="h-8 w-8 text-zinc-500 hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir despesa"
                          onClick={() => setDeleteId(expense.id)}
                          className="h-8 w-8 text-zinc-500 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`hidden rounded-lg border border-zinc-200 md:block md:overflow-hidden ${filterLoading ? 'opacity-55' : ''}`}>
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="font-semibold text-zinc-700">Descricao</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Valor</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Data</TableHead>
                  <TableHead className="text-right font-semibold text-zinc-700">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-zinc-500">
                      Nenhuma despesa neste periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="transition-colors hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-800">{expense.description}</TableCell>
                      <TableCell className="font-semibold text-red-500">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-zinc-600">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 text-zinc-500 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(expense.id)}
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
          {filterLoading && (
            <div className="pointer-events-none absolute inset-x-4 top-1/2 hidden -translate-y-1/2 justify-center md:flex">
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Carregando dados...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={editingExpense}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  if (deleteId) {
                    await onDeleteExpense(deleteId)
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
