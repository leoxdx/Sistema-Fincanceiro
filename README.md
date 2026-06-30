# 💰 Sistema Financeiro

> Aplicação web full stack para controle de receitas e despesas, com dashboard, gráficos, filtros, listagem de transações e exportação para Excel.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🔗 Demo

**Acesse a demonstração:** _[adicionar link da demo aqui]_

**Credenciais de demonstração:**

```
E-mail: demo@demo.com
Senha:  demo123
```

> ⚠️ A demo roda em um banco isolado e com dados fictícios, apenas para fins de demonstração. Os dados podem ser resetados a qualquer momento.

---

## 📸 Preview

> _Adicione aqui um GIF ou prints do sistema rodando — é o que mais chama atenção de quem abre o repositório._

<!--
![Dashboard](./public/preview-dashboard.png)
![Transações](./public/preview-transacoes.png)
-->

---

## ✨ Funcionalidades

- 📊 **Dashboard** com visão geral de receitas, despesas e saldo
- 📈 **Gráficos** interativos (Recharts) para acompanhar a evolução financeira
- 💸 **Cadastro de transações** (receitas e despesas) com categorias
- 🔎 **Filtros** por período, tipo e categoria
- 📋 **Listagem** de transações com ordenação
- 📤 **Exportação para Excel** (ExcelJS)
- 🔐 **Acesso protegido** por autenticação
- 🌙 **Tema claro/escuro** (next-themes)
- 📱 **Layout responsivo** com TailwindCSS e componentes acessíveis (shadcn/ui + Radix)

---

## 🛠️ Tecnologias

**Front-end**
- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Recharts](https://recharts.org/) — gráficos
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — formulários e validação
- [Lucide React](https://lucide.dev/) — ícones
- [Sonner](https://sonner.emilkowal.ski/) — notificações

**Back-end / Dados**
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Supabase](https://supabase.com/) (banco PostgreSQL gerenciado)
- [ExcelJS](https://github.com/exceljs/exceljs) — geração de planilhas

---

## 🚀 Rodando localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recomendado) ou npm
- Um banco PostgreSQL (local ou no [Supabase](https://supabase.com/))

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/leoxdx/Sistema-Fincanceiro.git
cd Sistema-Fincanceiro

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com seus valores (veja a seção abaixo)

# 4. Gere o Prisma Client e sincronize o banco
pnpm prisma:generate
pnpm db:push

# 5. Rode o projeto em modo de desenvolvimento
pnpm dev
```

A aplicação ficará disponível em **http://localhost:3000**.

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` na raiz (use o `.env.example` como base):

| Variável         | Descrição                                              |
| ---------------- | ------------------------------------------------------ |
| `DATABASE_URL`   | String de conexão do PostgreSQL                        |
| `ADMIN_EMAIL`    | E-mail usado para acessar o sistema                    |
| `ADMIN_PASSWORD` | Senha de acesso ao sistema                             |

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SuaSenhaSecreta
```

> 🔒 O arquivo `.env` **nunca** deve ser enviado ao GitHub. Ele já está no `.gitignore`.

---

## 📜 Scripts disponíveis

| Comando                | O que faz                                  |
| ---------------------- | ------------------------------------------ |
| `pnpm dev`             | Inicia o servidor de desenvolvimento       |
| `pnpm build`           | Gera a build de produção                   |
| `pnpm start`           | Roda a build de produção                   |
| `pnpm lint`            | Roda o ESLint                              |
| `pnpm prisma:generate` | Gera o Prisma Client                       |
| `pnpm db:push`         | Sincroniza o schema do Prisma com o banco  |

---

## 📁 Estrutura do projeto

```
Sistema-Fincanceiro/
├── app/          # Rotas e páginas (Next.js App Router)
├── components/   # Componentes de UI reutilizáveis
├── hooks/        # Custom hooks de React
├── lib/          # Utilitários e configurações
├── prisma/       # Schema e migrações do Prisma
├── public/       # Arquivos estáticos
├── styles/       # Estilos globais
└── .env.example  # Exemplo de variáveis de ambiente
```

---

## 🗺️ Roadmap

- [ ] Instância de demonstração pública com dados fictícios
- [ ] Script de seed para popular o banco
- [ ] Testes automatizados
- [ ] Cadastro de múltiplos usuários (multiusuário)
- [ ] Categorias personalizáveis

---

## 👤 Autor

**Leonardo Souza**

[![GitHub](https://img.shields.io/badge/GitHub-leoxdx-181717?logo=github)](https://github.com/leoxdx)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-lms--souza-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lms-souza/)
[![Email](https://img.shields.io/badge/Email-leonardomtzsouza@gmail.com-EA4335?logo=gmail&logoColor=white)](mailto:leonardomtzsouza@gmail.com)

---

> Projeto desenvolvido com foco em organização financeira e boas práticas de arquitetura full stack.
