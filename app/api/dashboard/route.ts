import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export async function GET(req: Request) {
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')

  const paymentFilter = start && end
    ? { date: { gte: new Date(start), lte: new Date(end) } }
    : {}

  const expenseFilter = start && end
    ? { date: { gte: new Date(start), lte: new Date(end) } }
    : {}

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({ where: paymentFilter }),
    prisma.expense.findMany({ where: expenseFilter })
  ])

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  const monthlyMap = new Map<string, { month: string; receita: number; despesas: number }>()

  payments.forEach((payment) => {
    const month = monthNames[payment.date.getMonth()]
    const current = monthlyMap.get(month) || { month, receita: 0, despesas: 0 }
    monthlyMap.set(month, { ...current, receita: current.receita + payment.amount })
  })

  expenses.forEach((expense) => {
    const month = monthNames[expense.date.getMonth()]
    const current = monthlyMap.get(month) || { month, receita: 0, despesas: 0 }
    monthlyMap.set(month, { ...current, despesas: current.despesas + expense.amount })
  })

  const monthlyData = Array.from(monthlyMap.values())
    .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    netProfit,
    monthlyData
  })
}
