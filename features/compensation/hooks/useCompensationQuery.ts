// features/compensation/hooks/useCompensationQuery.ts
// TanStack Query hook for the compensation explore API
// Filter state is synced to URL params externally (in ExploreClient)

import { useQuery } from '@tanstack/react-query'
import { buildQueryString } from '@/lib/utils'

export interface CompensationQueryParams {
  universalLevel?: string
  roleTrack?: string
  roleFamily?: string
  roleSpecialization?: string
  companyId?: string
  companySlug?: string
  locationId?: string
  locationSlug?: string
  locationTier?: string
  yoeTotalMin?: string
  yoeTotalMax?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  pageSize?: number
  status?: string
}

async function fetchCompensation(params: CompensationQueryParams) {
  const qs = buildQueryString(params as Record<string, string | number | boolean | undefined | null>)
  const res = await fetch(`/api/v1/compensation?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch compensation data')
  const envelope = await res.json()
  return envelope.data !== null ? envelope : null
}

export function useCompensationQuery(params: CompensationQueryParams) {
  return useQuery({
    queryKey: ['compensation', params],
    queryFn: () => fetchCompensation(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (prev) => prev, // Keep old data while fetching new page
  })
}
