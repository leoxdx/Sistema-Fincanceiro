import { NextResponse } from 'next/server'
import { z } from 'zod'
import ExcelJS from 'exceljs'
import prisma from '@/lib/prisma'

const reportSchema = z.object({
  month: z.string().regex(/^[0-9]{2}$/),
  year: z.string().regex(/^[0-9]{4}$/),
  excludeCash: z.boolean().optional(),
  format: z.enum(['csv', 'xlsx']).optional()
})

export async function POST(req: Request) {
  const body = await req.json()
  const parse = reportSchema.safeParse(body)

  if (!parse.success) {
    return NextResponse.json({ message: 'Parâmetros de relatório inválidos' }, { status: 400 })
  }

  const { month, year, excludeCash = false, format = 'xlsx' } = parse.data
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

  const filename = `relatorio-${year}-${month}${excludeCash ? '-sem-dinheiro' : ''}.${format}`

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Relatório')

    sheet.columns = [
      { header: 'Paciente', key: 'patient', width: 30 },
      { header: 'CPF', key: 'cpf', width: 18 },
      { header: 'Valor', key: 'amount', width: 14 },
      { header: 'Método', key: 'method', width: 14 },
      { header: 'Data', key: 'date', width: 14 }
    ]

    payments.forEach((payment) => {
      sheet.addRow({
        patient: payment.patient.name,
        cpf: payment.patient.cpf,
        amount: payment.amount,
        method: payment.method,
        date: payment.date.toISOString().split('T')[0]
      })
    })

    sheet.getRow(1).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  }

  const headers = ['Paciente', 'CPF', 'Valor', 'Método', 'Data']
  const rows = payments.map((payment) => ([
    payment.patient.name,
    payment.patient.cpf,
    payment.amount.toFixed(2).replace('.', ','),
    payment.method,
    payment.date.toISOString().split('T')[0]
  ]))

  const csv = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
