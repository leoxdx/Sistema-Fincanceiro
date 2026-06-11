import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { MAX_TRANSACTION_AMOUNT } from '@/lib/amount'
import { createMonthDateRange, formatDateOnlyFromDate, parseDateOnlyToUtcDate } from '@/lib/date-utils'
import { createMissingPatientCpfToken, getVisiblePatientCpf, normalizePatientCpf } from '@/lib/patient-cpf'

const paymentSchema = z.object({
  patientName: z.string().min(1),
  patientCpf: z.string().optional().default(''),
  amount: z.number().positive().max(MAX_TRANSACTION_AMOUNT),
  method: z.enum(['pix', 'credit', 'debit', 'boleto', 'cash']),
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

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { patient: true }
  })

  return NextResponse.json(
    payments.map((payment) => ({
      id: payment.id.toString(),
      patientId: payment.patientId.toString(),
      patientName: payment.patient.name,
      patientCpf: getVisiblePatientCpf(payment.patient.cpf),
      amount: payment.amount,
      method: payment.method,
      date: formatDateOnlyFromDate(payment.date)
    }))
  )
}

export async function POST(req: Request) {
  const body = await req.json()
  const parse = paymentSchema.safeParse(body)

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

  const payment = await prisma.payment.create({
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
}
