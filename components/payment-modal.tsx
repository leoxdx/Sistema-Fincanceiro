'use client'

import { useState, useEffect } from 'react'
import { PaymentMethod, Payment } from '@/lib/types'
import { formatCPF, validateCPF } from '@/lib/utils-format'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { patientName: string; patientCpf: string; amount: number; method: PaymentMethod; date: string }) => Promise<void>
  initialData?: Payment | null
}

export function PaymentModal({ isOpen, onClose, onSave, initialData }: PaymentModalProps) {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.patientName)
      setCpf(initialData.patientCpf)
      setAmount(initialData.amount.toString())
      setMethod(initialData.method)
      setDate(initialData.date)
    } else {
      setName('')
      setCpf('')
      setAmount('')
      setMethod('pix')
      setDate(new Date().toISOString().split('T')[0])
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleCpfChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      setCpf(formatCPF(cleaned))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!cpf.trim()) newErrors.cpf = 'CPF é obrigatório'
    else if (!validateCPF(cpf)) newErrors.cpf = 'CPF inválido'
    if (!amount.trim()) newErrors.amount = 'Valor é obrigatório'
    else if (parseFloat(amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero'
    if (!date) newErrors.date = 'Data é obrigatória'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await onSave({
        patientName: name,
        patientCpf: cpf,
        amount: parseFloat(amount),
        method,
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
            {initialData ? 'Editar Pagamento' : 'Adicionar Pagamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-700">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Nome do paciente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-zinc-700">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              className={errors.cpf ? 'border-red-500' : ''}
            />
            {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-zinc-700">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method" className="text-zinc-700">Método de Pagamento</Label>
            <Select value={method} onValueChange={(value: PaymentMethod) => setMethod(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-zinc-700">Data do Pagamento</Label>
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
