import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const paymentUpdateSchema = z.object({
  patientName: z.string().min(1),
  patientCpf: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['pix', 'credit', 'debit', 'boleto', 'cash']),
  date: z.string().min(1)
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const paymentId = Number(params.id)
  if (Number.isNaN(paymentId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  const body = await req.json()
  const parse = paymentUpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ message: 'Entrada inválida' }, { status: 400 })
  }

  const { patientName, patientCpf, amount, method, date } = parse.data
  const patient = await prisma.patient.upsert({
    where: { cpf: patientCpf },
    update: { name: patientName },
    create: { name: patientName, cpf: patientCpf }
  })

  const payment = await prisma.payment.update({
    where: { id: paymentId },
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const paymentId = Number(params.id)
  if (Number.isNaN(paymentId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  await prisma.payment.delete({ where: { id: paymentId } })
  return NextResponse.json({ success: true })
}
