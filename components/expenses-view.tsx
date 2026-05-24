'use client'

import { useState } from 'react'
import { Expense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils-format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ExpensesViewProps {
  expenses: Expense[]
  onAddExpense: (expense: Omit<Expense, 'id'>) => void
}

export function ExpensesView({ expenses, onAddExpense }: ExpensesViewProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onAddExpense({
      description,
      amount: parseFloat(amount),
      date
    })

    setDescription('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setErrors({})
    setLoading(false)
    toast.success('Despesa lançada com sucesso!')
  }

  const recentExpenses = [...expenses].slice(0, 5)

  return (
    <div className="space-y-6">
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

      {/* Recent Expenses Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-zinc-800">Últimas Despesas Lançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="font-semibold text-zinc-700">Descrição</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Valor</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-zinc-500">
                      Nenhuma despesa lançada
                    </TableCell>
                  </TableRow>
                ) : (
                  recentExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-zinc-50 transition-colors">
                      <TableCell className="font-medium text-zinc-800">{expense.description}</TableCell>
                      <TableCell className="font-semibold text-red-500">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-zinc-600">{formatDate(expense.date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
