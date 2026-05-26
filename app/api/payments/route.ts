import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const paymentSchema = z.object({
  patientName: z.string().min(1),
  patientCpf: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['pix', 'credit', 'debit', 'boleto', 'cash']),
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
      patientCpf: payment.patient.cpf,
      amount: payment.amount,
      method: payment.method,
      date: payment.date.toISOString().split('T')[0]
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
  const patient = await prisma.patient.upsert({
    where: { cpf: patientCpf },
    update: { name: patientName },
    create: { name: patientName, cpf: patientCpf }
  })

  const payment = await prisma.payment.create({
    data: {
      patientId: patient.id,
      amount,
      method,
      date: new Date(date)
    },
    include: { patient: true }
  })

  return NextResponse.json({
    id: payment.id.toString(),
    patientId: payment.patientId.toString(),
    patientName: payment.patient.name,
    patientCpf: payment.patient.cpf,
    amount: payment.amount,
    method: payment.method,
    date: payment.date.toISOString().split('T')[0]
  })
}
