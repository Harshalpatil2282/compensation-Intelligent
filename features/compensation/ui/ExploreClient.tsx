// features/compensation/ui/ExploreClient.tsx
// Client component: ties together FilterSidebar + CompensationTable + pagination
// Syncs filter state to URL search params

'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FilterSidebar, type FilterState } from './FilterSidebar'
import { CompensationTable, type CompensationRow } from './CompensationTable'
import { PercentileBand } from './PercentileBand'
import { Button } from '@/components/ui/button'
import { useCompensationQuery } from '../hooks/useCompensationQuery'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ExploreClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize filter state from URL params
  const [filters, setFilters] = useState<FilterState>({
    universalLevel: searchParams.get('universalLevel') ?? '',
    roleTrack: searchParams.get('roleTrack') ?? '',
    locationTier: searchParams.get('locationTier') ?? '',
    yoeTotalMin: searchParams.get('yoeTotalMin') ?? '',
    yoeTotalMax: searchParams.get('yoeTotalMax') ?? '',
    dateFrom: searchParams.get('dateFrom') ?? '',
  })
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'totalCompUsd' | 'baseSalaryUsd' | 'yoeTotal' | 'submittedAt'>('totalCompUsd')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Sync filters to URL
  const updateURL = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname]
  )

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPage(1)
    updateURL(newFilters)
  }

  const handleReset = () => {
    const empty: FilterState = {
      universalLevel: '',
      roleTrack: '',
      locationTier: '',
      yoeTotalMin: '',
      yoeTotalMax: '',
      dateFrom: '',
    }
    setFilters(empty)
    setPage(1)
    router.replace(pathname, { scroll: false })
  }

  const handleSort = (key: typeof sortBy, order: typeof sortOrder) => {
    setSortBy(key)
    setSortOrder(order)
    setPage(1)
  }

  const { data, isLoading, error } = useCompensationQuery({
    ...filters,
    page,
    pageSize: 20,
    sortBy,
    sortOrder,
    status: 'APPROVED',
  })

  const rows = (data?.data ?? []) as CompensationRow[]
  const meta = data?.meta

  return (
    <div className="flex gap-6">
      <FilterSidebar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="flex-1 min-w-0 space-y-4">
        {/* Percentile summary */}
        {rows.length > 0 && !isLoading && (
          <div className="glass-card p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Comp Distribution ({meta?.total ?? 0} records)
            </p>
            <PercentileBand
              p25={Math.round(rows.slice().sort((a, b) => a.totalCompUsd - b.totalCompUsd)[Math.floor(rows.length * 0.25)]?.totalCompUsd ?? 0)}
              p50={Math.round(rows.slice().sort((a, b) => a.totalCompUsd - b.totalCompUsd)[Math.floor(rows.length * 0.5)]?.totalCompUsd ?? 0)}
              p75={Math.round(rows.slice().sort((a, b) => a.totalCompUsd - b.totalCompUsd)[Math.floor(rows.length * 0.75)]?.totalCompUsd ?? 0)}
              p90={Math.round(rows.slice().sort((a, b) => a.totalCompUsd - b.totalCompUsd)[Math.floor(rows.length * 0.9)]?.totalCompUsd ?? 0)}
              showLabels
            />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass-card p-6 text-center text-red-400">
            Failed to load data. Please try again.
          </div>
        )}

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <CompensationTable
            data={rows}
            isLoading={isLoading}
            onSort={handleSort}
            currentSort={{ key: sortBy, order: sortOrder }}
          />
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {(meta.page - 1) * meta.pageSize + 1}–{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm text-slate-400">
                {meta.page} / {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
