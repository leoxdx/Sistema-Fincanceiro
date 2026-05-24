export interface Patient {
  id: string
  name: string
  cpf: string
}

export interface Payment {
  id: string
  patientId: string
  patientName: string
  patientCpf: string
  amount: number
  method: PaymentMethod
  date: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
}

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'boleto' | 'cash'

export type View = 'dashboard' | 'payments' | 'expenses' | 'reports'
