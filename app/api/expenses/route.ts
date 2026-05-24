import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const expenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1)
})

export async function GET() {
  const expenses = await prisma.expense.findMany({
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
