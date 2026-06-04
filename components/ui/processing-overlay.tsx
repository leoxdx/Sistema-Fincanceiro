'use client'

import { Loader2 } from 'lucide-react'

interface ProcessingOverlayProps {
  message: string | null
}

export function ProcessingOverlay({ message }: ProcessingOverlayProps) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/20 px-4 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-800 shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>{message}</span>
      </div>
    </div>
  )
}
