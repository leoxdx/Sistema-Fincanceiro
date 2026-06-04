import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { MAX_TRANSACTION_AMOUNT } from '@/lib/amount'
import { createMonthDateRange, formatDateOnlyFromDate, parseDateOnlyToUtcDate } from '@/lib/date-utils'

const expenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive().max(MAX_TRANSACTION_AMOUNT),
  date: z.string().min(1)
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  let where = {}
  if (month && year) {
    const { start, end } = createMonthDateRange(year, month)
    where = {
      date: {
        gte: start,
        lt: end
      }
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(
    expenses.map((expense) => ({
      id: expense.id.toString(),
      description: expense.description,
      amount: expense.amount,
      date: formatDateOnlyFromDate(expense.date)
    }))
  )
}

export async function POST(req: Request) {
  const body = await req.json()
  const parse = expenseSchema.safeParse(body)

  if (!parse.success) {
    return NextResponse.json({ message: 'Entrada inválida' }, { status: 400 })
  }

  const { description, amount, date } = parse.data
  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      date: parseDateOnlyToUtcDate(date)
    }
  })

  return NextResponse.json({
    id: expense.id.toString(),
    description: expense.description,
    amount: expense.amount,
    date: formatDateOnlyFromDate(expense.date)
  })
}
