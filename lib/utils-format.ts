import { formatDateOnlyForDisplay } from './date-utils'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false
  return true
}

export function formatDate(date: string): string {
  return formatDateOnlyForDisplay(date)
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pix: 'Pix',
    credit: 'Cartão Crédito',
    debit: 'Cartão Débito',
    boleto: 'Boleto',
    cash: 'Dinheiro'
  }
  return labels[method] || method
}

export function getPaymentMethodColor(method: string): string {
  const colors: Record<string, string> = {
    pix: 'bg-emerald-100 text-emerald-700',
    credit: 'bg-blue-100 text-blue-700',
    debit: 'bg-purple-100 text-purple-700',
    boleto: 'bg-amber-100 text-amber-700',
    cash: 'bg-zinc-100 text-zinc-700'
  }
  return colors[method] || 'bg-zinc-100 text-zinc-700'
}
