'use client'

import type * as React from 'react'
import { useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/utils-format'
import { cn } from '@/lib/utils'

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string
}

export function DateInput({ className, value, disabled, ...props }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    if (disabled) return

    const input = inputRef.current
    input?.focus()

    try {
      if (input?.showPicker) {
        input.showPicker()
        return
      }
    } catch {
      // Some mobile browsers open the native picker on focus and reject showPicker.
    }

    input?.click()
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openPicker()
        }
      }}
      className={cn(
        'relative flex h-10 w-full min-w-0 cursor-pointer items-center rounded-md border border-input bg-zinc-50 px-3 text-base shadow-xs transition-[color,box-shadow] md:h-9 md:text-sm',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className={cn('min-w-0 flex-1 truncate', value ? 'text-zinc-900' : 'text-muted-foreground')}>
        {value ? formatDate(value) : 'dd/mm/aaaa'}
      </span>
      <CalendarDays className="ml-3 h-4 w-4 shrink-0 text-zinc-400" />
      <input
        ref={inputRef}
        type="date"
        value={value}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-px w-px -translate-y-1/2 opacity-0"
        {...props}
      />
    </div>
  )
}
