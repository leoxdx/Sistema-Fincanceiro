import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Reference Financeiro',
  description: 'Sistema de gestao para consultorio odontologico',
  applicationName: 'Reference Financeiro',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Reference Financeiro',
    statusBarStyle: 'default'
  },
  icons: {
    icon: [
      { url: '/icon-reference-rounded.png', sizes: '1254x1254', type: 'image/png' }
    ],
    shortcut: ['/icon-reference-rounded.png'],
    apple: [{ url: '/icon-reference-rounded.png', sizes: '1254x1254', type: 'image/png' }]
  },
  generator: 'Leonardo Souza'
}

export const viewport: Viewport = {
  themeColor: '#059669',
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
