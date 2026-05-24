import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const reportSchema = z.object({
  month: z.string().regex(/^[0-9]{2}$/),
  year: z.string().regex(/^[0-9]{4}$/),
  excludeCash: z.boolean().optional()
})

export async function POST(req: Request) {
  const body = await req.json()
  const parse = reportSchema.safeParse(body)

  if (!parse.success) {
    return NextResponse.json({ message: 'Parâmetros de relatório inválidos' }, { status: 400 })
  }

  const { month, year, excludeCash = false } = parse.data
  const startDate = new Date(`${year}-${month}-01T00:00:00Z`)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 1)

  const payments = await prisma.payment.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      },
      ...(excludeCash ? { method: { not: 'cash' } } : {})
    },
    include: { patient: true },
    orderBy: { date: 'asc' }
  })

  const headers = ['Paciente', 'CPF', 'Valor', 'Método', 'Data']
  const rows = payments.map((payment) => ([
    payment.patient.name,
    payment.patient.cpf,
    payment.amount.toFixed(2).replace('.', ','),
    payment.method,
    payment.date.toISOString().split('T')[0]
  ]))

  const csv = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n')
  const filename = `relatorio-${year}-${month}${excludeCash ? '-sem-dinheiro' : ''}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
