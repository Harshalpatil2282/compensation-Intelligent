// features/compensation/ui/FilterSidebar.tsx
// Collapsible filter sidebar for the compensation explorer

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const UNIVERSAL_LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9']
const ROLE_TRACKS = ['Engineering', 'Product', 'Design', 'Data', 'Business']
const LOCATION_TIERS = [
  { value: 'TIER_1', label: 'Tier 1 (SF, NYC, London)' },
  { value: 'TIER_2', label: 'Tier 2 (Bangalore, Pune)' },
  { value: 'TIER_3', label: 'Tier 3 (Smaller cities)' },
  { value: 'REMOTE', label: 'Remote' },
]

const YOE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '0', label: '0–2 years' },
  { value: '3', label: '3–5 years' },
  { value: '6', label: '6–8 years' },
  { value: '9', label: '9–12 years' },
  { value: '13', label: '13+ years' },
]

export interface FilterState {
  universalLevel: string
  roleTrack: string
  locationTier: string
  yoeTotalMin: string
  yoeTotalMax: string
  dateFrom: string
}

interface FilterSidebarProps {
  filters: FilterState
  onChange: (key: keyof FilterState, value: string) => void
  onReset: () => void
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-white/5 pb-4">
      <button
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        )}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  )
}

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <aside
      className="w-64 shrink-0 space-y-0"
      aria-label="Compensation filters"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="gap-1 text-slate-400 hover:text-white"
          >
            <X className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      <FilterSection title="Level">
        <div className="grid grid-cols-3 gap-1.5">
          {UNIVERSAL_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() =>
                onChange('universalLevel', filters.universalLevel === level ? '' : level)
              }
              className={cn(
                'rounded-md px-2 py-1.5 text-xs font-mono font-bold transition-all',
                filters.universalLevel === level
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              )}
              aria-pressed={filters.universalLevel === level}
            >
              {level}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Role Track">
        <div className="space-y-1">
          {ROLE_TRACKS.map((track) => (
            <button
              key={track}
              onClick={() =>
                onChange('roleTrack', filters.roleTrack === track ? '' : track)
              }
              className={cn(
                'w-full text-left rounded-md px-3 py-2 text-sm transition-all',
                filters.roleTrack === track
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
              aria-pressed={filters.roleTrack === track}
            >
              {track}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Location Tier" defaultOpen={false}>
        <div className="space-y-1">
          {LOCATION_TIERS.map((tier) => (
            <button
              key={tier.value}
              onClick={() =>
                onChange('locationTier', filters.locationTier === tier.value ? '' : tier.value)
              }
              className={cn(
                'w-full text-left rounded-md px-3 py-2 text-sm transition-all',
                filters.locationTier === tier.value
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
              aria-pressed={filters.locationTier === tier.value}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Years of Experience" defaultOpen={false}>
        <div className="space-y-2">
          <Select
            label="Minimum YOE"
            value={filters.yoeTotalMin}
            onChange={(e) => onChange('yoeTotalMin', e.target.value)}
            id="filter-yoe-min"
          >
            {YOE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </FilterSection>

      <FilterSection title="Date Range" defaultOpen={false}>
        <div>
          <label className="text-xs text-slate-400 mb-1 block" htmlFor="filter-date-from">
            From
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange('dateFrom', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </FilterSection>
    </aside>
  )
}
