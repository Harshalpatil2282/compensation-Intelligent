// features/compensation/ui/CompensationTable.tsx
// Full sortable compensation data table with inline percentile band

'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { LevelBadge } from './LevelBadge'
import { Badge } from '@/components/ui/badge'
import { TableRowSkeleton } from '@/components/ui/skeleton'
import { formatUSD, formatRelativeTime } from '@/lib/utils'
import type { UniversalLevel } from '@/lib/level-normalization'
import Link from 'next/link'

export interface CompensationRow {
  id: string
  jobTitle: string
  universalLevel: string
  companyLevelCode: string | null
  company: { id: string; name: string; slug: string; logoUrl: string | null }
  location: { city: string; country: string; tier: string }
  role: { track: string; family: string; specialization: string }
  baseSalaryUsd: number
  equityAnnualUsd: number | null
  totalCompUsd: number
  yoeTotal: number
  currency: string
  baseSalaryLocal: number
  submittedAt: string
  verified: boolean
}

type SortKey = 'totalCompUsd' | 'baseSalaryUsd' | 'yoeTotal' | 'submittedAt'

interface CompensationTableProps {
  data: CompensationRow[]
  isLoading?: boolean
  onSort?: (key: SortKey, order: 'asc' | 'desc') => void
  currentSort?: { key: SortKey; order: 'asc' | 'desc' }
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentSort?: { key: SortKey; order: 'asc' | 'desc' }
  onSort?: (key: SortKey, order: 'asc' | 'desc') => void
}) {
  const isActive = currentSort?.key === sortKey
  const nextOrder = isActive && currentSort.order === 'desc' ? 'asc' : 'desc'

  return (
    <button
      className="inline-flex items-center gap-1 hover:text-white transition-colors"
      onClick={() => onSort?.(sortKey, nextOrder)}
      aria-label={`Sort by ${label} ${nextOrder}`}
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp
          className={`h-2.5 w-2.5 -mb-0.5 ${isActive && currentSort.order === 'asc' ? 'text-indigo-400' : 'text-slate-600'}`}
        />
        <ChevronDown
          className={`h-2.5 w-2.5 ${isActive && currentSort.order === 'desc' ? 'text-indigo-400' : 'text-slate-600'}`}
        />
      </span>
    </button>
  )
}

export function CompensationTable({
  data,
  isLoading = false,
  onSort,
  currentSort,
}: CompensationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full data-table min-w-[900px]">
        <thead>
          <tr className="bg-white/5">
            <th>Company</th>
            <th>Role</th>
            <th>Level</th>
            <th>Location</th>
            <th>
              <SortHeader
                label="Base"
                sortKey="baseSalaryUsd"
                currentSort={currentSort}
                onSort={onSort}
              />
            </th>
            <th>Equity/yr</th>
            <th>
              <SortHeader
                label="Total TC"
                sortKey="totalCompUsd"
                currentSort={currentSort}
                onSort={onSort}
              />
            </th>
            <th>
              <SortHeader
                label="YOE"
                sortKey="yoeTotal"
                currentSort={currentSort}
                onSort={onSort}
              />
            </th>
            <th>
              <SortHeader
                label="Date"
                sortKey="submittedAt"
                currentSort={currentSort}
                onSort={onSort}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={9} />
              ))
            : data.length === 0
            ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No compensation data found for these filters.
                  </td>
                </tr>
              )
            : data.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td>
                    <Link
                      href={`/company/${row.company.slug}`}
                      className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                        {row.company.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{row.company.name}</div>
                        <div className="text-xs text-slate-500">{row.role.track}</div>
                      </div>
                    </Link>
                  </td>

                  <td>
                    <div className="text-sm text-slate-200">{row.jobTitle}</div>
                    <div className="text-xs text-slate-500">{row.role.specialization}</div>
                  </td>

                  <td>
                    <LevelBadge
                      universalLevel={row.universalLevel as UniversalLevel}
                      companyLevelCode={row.companyLevelCode}
                    />
                  </td>

                  <td>
                    <div className="text-sm text-slate-300">{row.location.city}</div>
                    <div className="text-xs text-slate-500">{row.location.country}</div>
                  </td>

                  <td className="font-mono text-sm text-slate-200">
                    <div>{formatUSD(row.baseSalaryUsd)}</div>
                    {row.currency !== 'USD' && (
                      <div className="text-xs text-slate-500">
                        {row.currency} {row.baseSalaryLocal.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  <td className="font-mono text-sm text-emerald-400">
                    {row.equityAnnualUsd ? formatUSD(row.equityAnnualUsd) : <span className="text-slate-600">—</span>}
                  </td>

                  <td className="font-mono text-sm font-bold text-white">
                    {formatUSD(row.totalCompUsd)}
                  </td>

                  <td className="text-sm text-slate-400">
                    {row.yoeTotal}y
                  </td>

                  <td className="text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      {formatRelativeTime(row.submittedAt)}
                      {row.verified && (
                        <Badge variant="success" size="sm">✓</Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
