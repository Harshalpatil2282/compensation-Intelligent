// components/ui/badge.tsx

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md font-medium text-xs transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-slate-800 text-slate-300 border border-white/10',
        primary:   'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        success:   'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        warning:   'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        danger:    'bg-red-500/20 text-red-300 border border-red-500/30',
        level:     'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        gradient:  'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}
