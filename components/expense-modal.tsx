'use client'

import { useState, useEffect } from 'react'
import { Expense } from '@/lib/types'
import { parseCurrencyAmount, validateTransactionAmount } from '@/lib/amount'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { description: string; amount: number; date: string }) => Promise<void>
  initialData?: Expense | null
}

export function ExpenseModal({ isOpen, onClose, onSave, initialData }: ExpenseModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description)
      setAmount(initialData.amount.toString())
      setDate(initialData.date)
    } else {
      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!description.trim()) newErrors.description = 'Descrição é obrigatória'
    if (!amount.trim()) newErrors.amount = 'Valor é obrigatório'
    else {
      const amountError = validateTransactionAmount(amount)
      if (amountError) newErrors.amount = amountError
    }
    if (!date) newErrors.date = 'Data é obrigatória'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const parsedAmount = parseCurrencyAmount(amount)
      if (parsedAmount === null) return

      await onSave({
        description,
        amount: parsedAmount,
        date
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-800">
            {initialData ? 'Editar Despesa' : 'Adicionar Despesa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-700">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Boleto Dental, Conta de Luz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-zinc-700">Valor (R$)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-zinc-700">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
