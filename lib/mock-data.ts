import { Payment, Expense } from './types'

export const mockPayments: Payment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Maria Silva Santos',
    patientCpf: '123.456.789-00',
    amount: 350.00,
    method: 'pix',
    date: '2024-01-15'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'João Pedro Oliveira',
    patientCpf: '987.654.321-00',
    amount: 1200.00,
    method: 'credit',
    date: '2024-01-14'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Ana Carolina Lima',
    patientCpf: '456.789.123-00',
    amount: 800.00,
    method: 'debit',
    date: '2024-01-13'
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Carlos Eduardo Souza',
    patientCpf: '321.654.987-00',
    amount: 2500.00,
    method: 'boleto',
    date: '2024-01-12'
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Fernanda Costa Alves',
    patientCpf: '789.123.456-00',
    amount: 450.00,
    method: 'cash',
    date: '2024-01-11'
  },
  {
    id: '6',
    patientId: '6',
    patientName: 'Ricardo Mendes',
    patientCpf: '654.321.987-00',
    amount: 680.00,
    method: 'pix',
    date: '2024-01-10'
  }
]

export const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Conta de Luz',
    amount: 450.00,
    date: '2024-01-15'
  },
  {
    id: '2',
    description: 'Salário - Auxiliar Dental',
    amount: 2800.00,
    date: '2024-01-05'
  },
  {
    id: '3',
    description: 'Material Odontológico - Dental Supply',
    amount: 1200.00,
    date: '2024-01-10'
  },
  {
    id: '4',
    description: 'Internet e Telefone',
    amount: 180.00,
    date: '2024-01-08'
  },
  {
    id: '5',
    description: 'Aluguel do Consultório',
    amount: 3500.00,
    date: '2024-01-01'
  }
]

export const monthlyData = [
  { month: 'Jan', receita: 15000, despesas: 8500 },
  { month: 'Fev', receita: 18000, despesas: 9200 },
  { month: 'Mar', receita: 22000, despesas: 10500 },
  { month: 'Abr', receita: 19500, despesas: 9800 },
  { month: 'Mai', receita: 24000, despesas: 11000 },
  { month: 'Jun', receita: 21000, despesas: 10200 }
]
