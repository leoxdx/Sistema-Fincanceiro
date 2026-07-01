// seed.mjs — popula o banco DEMO com dados fake de uma clinica odontologica
// Como rodar:  node seed.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---- helpers ----
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(12, 0, 0, 0)
  return d
}

const patients = [
  { name: 'Maria Silva Santos',      cpf: '123.456.789-00' },
  { name: 'João Pedro Oliveira',     cpf: '987.654.321-00' },
  { name: 'Ana Carolina Lima',       cpf: '456.789.123-00' },
  { name: 'Carlos Eduardo Souza',    cpf: '321.654.987-00' },
  { name: 'Fernanda Costa Almeida',  cpf: '741.852.963-00' },
  { name: 'Rafael Mendes Rocha',     cpf: '159.357.486-00' },
  { name: 'Juliana Ferreira Dias',   cpf: '258.147.369-00' },
  { name: 'Bruno Henrique Martins',  cpf: '369.258.147-00' },
]

const methods = ['pix', 'credit', 'debit', 'boleto', 'cash']

const expenses = [
  { description: 'Compra de materiais odontológicos', amount: 1250.00, date: daysAgo(20) },
  { description: 'Conta de energia elétrica',         amount: 480.90,  date: daysAgo(18) },
  { description: 'Salário assistente',                 amount: 2200.00, date: daysAgo(15) },
  { description: 'Manutenção de equipamento',          amount: 650.00,  date: daysAgo(12) },
  { description: 'Aluguel do consultório',             amount: 3000.00, date: daysAgo(10) },
  { description: 'Material de limpeza e esterilização',amount: 320.50,  date: daysAgo(7)  },
  { description: 'Internet e telefone',                amount: 199.90,  date: daysAgo(5)  },
  { description: 'Marketing digital',                  amount: 500.00,  date: daysAgo(3)  },
]

async function main() {
  console.log('Limpando dados antigos...')
  await prisma.payment.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.patient.deleteMany()

  console.log('Criando pacientes...')
  const createdPatients = []
  for (const p of patients) {
    const patient = await prisma.patient.create({ data: p })
    createdPatients.push(patient)
  }

  console.log('Criando pagamentos...')
  // gera 25 pagamentos espalhados nos ultimos 30 dias
  const values = [180, 250, 350, 420, 500, 650, 800, 1200, 1500, 2500]
  for (let i = 0; i < 25; i++) {
    const patient = createdPatients[i % createdPatients.length]
    await prisma.payment.create({
      data: {
        patientId: patient.id,
        amount: values[i % values.length],
        method: methods[i % methods.length],
        date: daysAgo(Math.floor(Math.random() * 30)),
      },
    })
  }

  console.log('Criando despesas...')
  for (const e of expenses) {
    await prisma.expense.create({ data: e })
  }

  const totalP = await prisma.payment.count()
  const totalE = await prisma.expense.count()
  const totalPat = await prisma.patient.count()
  console.log(`\nPronto! ${totalPat} pacientes, ${totalP} pagamentos, ${totalE} despesas.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
