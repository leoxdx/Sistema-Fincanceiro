import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const expenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1)
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  let where = {}
  if (month && year) {
    const startDate = new Date(`${year}-${month}-01T00:00:00Z`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
    where = {
      date: {
        gte: startDate,
        lt: endDate
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
      date: expense.date.toISOString().split('T')[0]
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
      date: new Date(date)
    }
  })

  return NextResponse.json({
    id: expense.id.toString(),
    description: expense.description,
    amount: expense.amount,
    date: expense.date.toISOString().split('T')[0]
  })
}
