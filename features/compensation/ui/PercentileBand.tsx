// features/compensation/ui/PercentileBand.tsx
// Visual horizontal bar showing p25/p50/p75/p90 with a marker for the current value

import { cn } from '@/lib/utils'
import { formatUSD } from '@/lib/utils'

interface PercentileBandProps {
  p25: number
  p50: number
  p75: number
  p90: number
  currentValue?: number  // If provided, shows a marker on the bar
  label?: string
  showLabels?: boolean
  className?: string
}

export function PercentileBand({
  p25,
  p50,
  p75,
  p90,
  currentValue,
  label,
  showLabels = true,
  className,
}: PercentileBandProps) {
  if (p90 === 0) return null

  // Calculate percentage positions (relative to p90)
  const pct = (v: number) => Math.min(100, Math.max(0, (v / p90) * 100))
  const p25Pct = pct(p25)
  const p50Pct = pct(p50)
  const p75Pct = pct(p75)
  const currentPct = currentValue !== undefined ? pct(currentValue) : undefined

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      )}

      {/* Bar */}
      <div className="relative h-5">
        {/* Background track */}
        <div className="absolute inset-0 bg-slate-800 rounded-full" />

        {/* p25–p75 range (IQR) — the main colored band */}
        <div
          className="absolute top-0 bottom-0 bg-gradient-to-r from-indigo-600/60 to-purple-600/60 rounded-sm"
          style={{ left: `${p25Pct}%`, right: `${100 - p75Pct}%` }}
        />

        {/* p50 marker (median line) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white rounded-full"
          style={{ left: `${p50Pct}%` }}
          title={`Median: ${formatUSD(p50)}`}
        />

        {/* Current value marker */}
        {currentPct !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 bg-amber-400 rounded-full ring-2 ring-amber-400/30"
            style={{ left: `${currentPct}%` }}
            title={`Your value: ${formatUSD(currentValue!)}`}
          />
        )}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>p25: {formatUSD(p25)}</span>
          <span>p50: {formatUSD(p50)}</span>
          <span>p75: {formatUSD(p75)}</span>
          <span>p90: {formatUSD(p90)}</span>
        </div>
      )}
    </div>
  )
}
