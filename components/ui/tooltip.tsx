// components/ui/tooltip.tsx
// Lightweight CSS-only tooltip (no dependency on Radix)

import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, side = 'top', className, children, ...props }: TooltipProps) {
  return (
    <div className={cn('relative inline-flex group', className)} {...props}>
      {children}
      <div
        role="tooltip"
        className={cn(
          'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white',
          'bg-slate-800 border border-white/10 rounded-lg shadow-xl',
          'pointer-events-none whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
          side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
          side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
          side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2'
        )}
      >
        {content}
      </div>
    </div>
  )
}
