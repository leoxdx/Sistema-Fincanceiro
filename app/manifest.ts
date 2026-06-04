import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Reference Financeiro',
    short_name: 'Reference',
    description: 'Sistema de gestao para consultorio odontologico',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon-reference-rounded.png',
        sizes: '1254x1254',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-reference-rounded.png',
        sizes: '1254x1254',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}
