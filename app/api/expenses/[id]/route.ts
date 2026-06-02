import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { MAX_TRANSACTION_AMOUNT } from '@/lib/amount'

const expenseUpdateSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive().max(MAX_TRANSACTION_AMOUNT),
  date: z.string().min(1)
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const expenseId = Number(id)
  if (Number.isNaN(expenseId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  const body = await req.json()
  const parse = expenseUpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ message: 'Entrada inválida' }, { status: 400 })
  }

  const { description, amount, date } = parse.data

  try {
    const expense = await prisma.expense.update({
      where: { id: expenseId },
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Despesa não encontrada' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const expenseId = Number(id)
  if (Number.isNaN(expenseId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    await prisma.expense.delete({ where: { id: expenseId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Despesa não encontrada' }, { status: 404 })
    }
    throw error
  }
}
