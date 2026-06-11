import { NextResponse } from 'next/server'
import { z } from 'zod'
import ExcelJS from 'exceljs'
import prisma from '@/lib/prisma'
import { createMonthDateRange, formatDateOnlyFromDate } from '@/lib/date-utils'
import { getVisiblePatientCpf } from '@/lib/patient-cpf'

const reportSchema = z.object({
  month: z.string().regex(/^[0-9]{2}$/),
  year: z.string().regex(/^[0-9]{4}$/),
  excludeCash: z.boolean().optional(),
  format: z.enum(['csv', 'xlsx']).optional()
})

const formatDate = (date: Date) => formatDateOnlyFromDate(date)
const formatCsvCurrency = (value: number) => value.toFixed(2).replace('.', ',')

function styleSheet(sheet: ExcelJS.Worksheet) {
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  }

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      }
    })
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parse = reportSchema.safeParse(body)

  if (!parse.success) {
    return NextResponse.json({ message: 'Parametros de relatorio invalidos' }, { status: 400 })
  }

  const { month, year, excludeCash = false, format = 'xlsx' } = parse.data
  const { start: startDate, end: endDate } = createMonthDateRange(year, month)

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

  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    orderBy: { date: 'asc' }
  })

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = totalRevenue - totalExpenses
  const filename = `relatorio-${year}-${month}${excludeCash ? '-sem-dinheiro' : ''}.${format}`

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook()
    const revenueSheet = workbook.addWorksheet('Faturamento')
    const expensesSheet = workbook.addWorksheet('Despesas')
    const summarySheet = workbook.addWorksheet('Resumo')

    revenueSheet.columns = [
      { header: 'Paciente', key: 'patient', width: 30 },
      { header: 'CPF', key: 'cpf', width: 18 },
      { header: 'Valor', key: 'amount', width: 14 },
      { header: 'Metodo', key: 'method', width: 14 },
      { header: 'Data', key: 'date', width: 14 }
    ]

    payments.forEach((payment) => {
      revenueSheet.addRow({
        patient: payment.patient.name,
        cpf: getVisiblePatientCpf(payment.patient.cpf),
        amount: payment.amount,
        method: payment.method,
        date: formatDate(payment.date)
      })
    })

    expensesSheet.columns = [
      { header: 'Descricao', key: 'description', width: 36 },
      { header: 'Valor', key: 'amount', width: 14 },
      { header: 'Data', key: 'date', width: 14 }
    ]

    expenses.forEach((expense) => {
      expensesSheet.addRow({
        description: expense.description,
        amount: expense.amount,
        date: formatDate(expense.date)
      })
    })

    summarySheet.columns = [
      { header: 'Indicador', key: 'label', width: 24 },
      { header: 'Valor', key: 'amount', width: 16 }
    ]
    summarySheet.addRows([
      { label: 'Faturamento', amount: totalRevenue },
      { label: 'Despesas', amount: totalExpenses },
      { label: 'Lucro', amount: profit }
    ])

    ;[revenueSheet, expensesSheet, summarySheet].forEach(styleSheet)
    revenueSheet.getColumn('amount').numFmt = '"R$"#,##0.00'
    expensesSheet.getColumn('amount').numFmt = '"R$"#,##0.00'
    summarySheet.getColumn('amount').numFmt = '"R$"#,##0.00'
    summarySheet.getRow(4).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  }

  const revenueHeaders = ['Paciente', 'CPF', 'Valor', 'Metodo', 'Data']
  const revenueRows = payments.map((payment) => ([
    payment.patient.name,
    getVisiblePatientCpf(payment.patient.cpf),
    formatCsvCurrency(payment.amount),
    payment.method,
    formatDate(payment.date)
  ]))

  const expenseHeaders = ['Descricao', 'Valor', 'Data']
  const expenseRows = expenses.map((expense) => ([
    expense.description,
    formatCsvCurrency(expense.amount),
    formatDate(expense.date)
  ]))

  const summaryRows = [
    ['Faturamento', formatCsvCurrency(totalRevenue)],
    ['Despesas', formatCsvCurrency(totalExpenses)],
    ['Lucro', formatCsvCurrency(profit)]
  ]

  const csv = [
    'Faturamento',
    revenueHeaders.join(';'),
    ...revenueRows.map((row) => row.join(';')),
    '',
    'Despesas',
    expenseHeaders.join(';'),
    ...expenseRows.map((row) => row.join(';')),
    '',
    'Resumo',
    'Indicador;Valor',
    ...summaryRows.map((row) => row.join(';'))
  ].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
