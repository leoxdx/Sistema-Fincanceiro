import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { MAX_TRANSACTION_AMOUNT } from '@/lib/amount'
import { formatDateOnlyFromDate, parseDateOnlyToUtcDate } from '@/lib/date-utils'
import { createMissingPatientCpfToken, getVisiblePatientCpf, normalizePatientCpf } from '@/lib/patient-cpf'

const paymentUpdateSchema = z.object({
  patientName: z.string().min(1),
  patientCpf: z.string().optional().default(''),
  amount: z.number().positive().max(MAX_TRANSACTION_AMOUNT),
  method: z.enum(['pix', 'credit', 'debit', 'boleto', 'cash']),
  date: z.string().min(1)
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const paymentId = Number(id)
  if (Number.isNaN(paymentId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  const body = await req.json()
  const parse = paymentUpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ message: 'Entrada inválida' }, { status: 400 })
  }

  const { patientName, patientCpf, amount, method, date } = parse.data
  const normalizedCpf = normalizePatientCpf(patientCpf)
  const patient = normalizedCpf
    ? await prisma.patient.upsert({
        where: { cpf: normalizedCpf },
        update: { name: patientName },
        create: { name: patientName, cpf: normalizedCpf }
      })
    : await prisma.patient.create({
        data: { name: patientName, cpf: createMissingPatientCpfToken() }
      })

  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        patientId: patient.id,
        amount,
        method,
        date: parseDateOnlyToUtcDate(date)
      },
      include: { patient: true }
    })

    return NextResponse.json({
      id: payment.id.toString(),
      patientId: payment.patientId.toString(),
      patientName: payment.patient.name,
      patientCpf: getVisiblePatientCpf(payment.patient.cpf),
      amount: payment.amount,
      method: payment.method,
      date: formatDateOnlyFromDate(payment.date)
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const paymentId = Number(id)
  if (Number.isNaN(paymentId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    await prisma.payment.delete({ where: { id: paymentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 })
    }
    throw error
  }
}
