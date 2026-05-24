import { NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(req: Request) {
  const body = await req.json()
  const parse = loginSchema.safeParse(body)

  if (!parse.success) {
    return NextResponse.json({ message: 'Entrada inválida' }, { status: 400 })
  }

  const { email, password } = parse.data
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ message: 'Servidor não configurado' }, { status: 500 })
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
