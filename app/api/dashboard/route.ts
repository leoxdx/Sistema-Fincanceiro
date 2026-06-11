import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createDateOnlyRange, formatDateOnlyFromDate, getTodayDateInputValue } from '@/lib/date-utils'

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

function getMonthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

function getMonthLabel(key: string, showYear: boolean) {
  const [year, month] = key.split('-')
  const label = monthNames[Number(month) - 1] ?? key
  return showYear ? `${label}/${year.slice(2)}` : label
}

function buildMonthBuckets(start: Date, endExclusive: Date) {
  const buckets = new Map<string, { month: string; receita: number; despesas: number }>()
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
  const lastIncludedDay = new Date(endExclusive)
  lastIncludedDay.setUTCDate(lastIncludedDay.getUTCDate() - 1)
  const last = new Date(Date.UTC(lastIncludedDay.getUTCFullYear(), lastIncludedDay.getUTCMonth(), 1))
  const showYear = cursor.getUTCFullYear() !== last.getUTCFullYear()

  while (cursor <= last) {
    const key = getMonthKey(cursor)
    buckets.set(key, { month: getMonthLabel(key, showYear), receita: 0, despesas: 0 })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return buckets
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const currentYear = getTodayDateInputValue().slice(0, 4)
  const start = url.searchParams.get('start') ?? `${currentYear}-01-01`
  const end = url.searchParams.get('end') ?? `${currentYear}-12-31`
  const range = createDateOnlyRange(start, end)

  const dateFilter = {
    date: {
      gte: range.start,
      lt: range.end
    }
  }

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({ where: dateFilter }),
    prisma.expense.findMany({ where: dateFilter })
  ])

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  const monthlyMap = buildMonthBuckets(range.start, range.end)

  payments.forEach((payment) => {
    const key = formatDateOnlyFromDate(payment.date).slice(0, 7)
    const current = monthlyMap.get(key)
    if (current) {
      monthlyMap.set(key, { ...current, receita: current.receita + payment.amount })
    }
  })

  expenses.forEach((expense) => {
    const key = formatDateOnlyFromDate(expense.date).slice(0, 7)
    const current = monthlyMap.get(key)
    if (current) {
      monthlyMap.set(key, { ...current, despesas: current.despesas + expense.amount })
    }
  })

  const monthlyData = Array.from(monthlyMap.values())

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    netProfit,
    monthlyData
  })
}
