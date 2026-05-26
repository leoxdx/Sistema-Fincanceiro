'use client'

import { useState } from 'react'
import { Expense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils-format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Save, Pencil, Trash2 } from 'lucide-react'
import { ExpenseModal } from './expense-modal'
import { toast } from 'sonner'

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

export function ExpensesView({ expenses, onAddExpense, onEditExpense, onDeleteExpense, onFilterChange }: ExpensesViewProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterLoading, setFilterLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!description.trim()) newErrors.description = 'Descrição é obrigatória'
    if (!amount.trim()) newErrors.amount = 'Valor é obrigatório'
    else if (parseFloat(amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero'
    if (!date) newErrors.date = 'Data é obrigatória'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await onAddExpense({
        description,
        amount: parseFloat(amount),
        date
      })

      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setErrors({})
      toast.success('Despesa lançada com sucesso!')
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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-zinc-600 text-sm">Mês</Label>
              <Select value={selectedMonth} onValueChange={(month) => handleFilterChange(month, selectedYear)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-zinc-600 text-sm">Ano</Label>
              <Select value={selectedYear} onValueChange={(year) => handleFilterChange(selectedMonth, year)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label className="text-zinc-600 text-sm">Total do Período</Label>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-zinc-800">Lançar Nova Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-700">
                  Prestador do Serviço / Descrição
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: Nome do Funcionário, Boleto Dental, Conta de Luz"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`bg-zinc-50 ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseAmount" className="text-zinc-700">Valor (R$)</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`bg-zinc-50 ${errors.amount ? 'border-red-500' : ''}`}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseDate" className="text-zinc-700">Data do Vencimento/Pagamento</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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

      {/* Expenses Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-zinc-800">Despesas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="font-semibold text-zinc-700">Descrição</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Valor</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Data</TableHead>
                  <TableHead className="font-semibold text-zinc-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-zinc-400" />
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                      Nenhuma despesa neste período
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-zinc-50 transition-colors">
                      <TableCell className="font-medium text-zinc-800">{expense.description}</TableCell>
                      <TableCell className="font-semibold text-red-500">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-zinc-600">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 text-zinc-500 hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(expense.id)}
                            className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-50"
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

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={editingExpense}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  await onDeleteExpense(deleteId)
                }
                setDeleteId(null)
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
