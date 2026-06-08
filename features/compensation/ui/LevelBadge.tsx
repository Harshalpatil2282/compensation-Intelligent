// features/compensation/ui/LevelBadge.tsx
// Displays universal level (L4) + company-specific level (E5) with tooltip

import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { UNIVERSAL_LEVELS, type UniversalLevel } from '@/lib/level-normalization'
import { cn } from '@/lib/utils'

const LEVEL_COLORS: Record<UniversalLevel, string> = {
  L1: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  L2: 'bg-green-500/20 text-green-300 border-green-500/30',
  L3: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  L4: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  L5: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  L6: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  L7: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  L8: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  L9: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

interface LevelBadgeProps {
  universalLevel: UniversalLevel
  companyLevelCode?: string | null
  showTitle?: boolean
  size?: 'sm' | 'md'
}

export function LevelBadge({
  universalLevel,
  companyLevelCode,
  showTitle = false,
  size = 'sm',
}: LevelBadgeProps) {
  const info = UNIVERSAL_LEVELS[universalLevel]

  return (
    <Tooltip
      content={
        <span>
          {universalLevel}: {info.title}
          <br />
          <span className="text-slate-400">{info.minYoe}{info.maxYoe ? `–${info.maxYoe}` : '+'} YOE typical</span>
        </span>
      }
    >
      <div className="flex flex-col gap-0.5 cursor-help">
        <span
          className={cn(
            'inline-flex items-center rounded-md border font-bold',
            LEVEL_COLORS[universalLevel],
            size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'
          )}
        >
          {universalLevel}
        </span>
        {companyLevelCode && (
          <span className="text-xs text-slate-500">{companyLevelCode}</span>
        )}
        {showTitle && (
          <span className="text-xs text-slate-500">{info.title}</span>
        )}
      </div>
    </Tooltip>
  )
}
