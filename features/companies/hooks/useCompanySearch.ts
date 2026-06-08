// features/companies/hooks/useCompanySearch.ts
// Debounced company autocomplete using TanStack Query

import { useQuery } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { debounce } from '@/lib/utils'

interface Company {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  industry: string | null
}

async function searchCompanies(q: string): Promise<Company[]> {
  if (!q.trim()) {
    const res = await fetch('/api/v1/companies?limit=10')
    if (!res.ok) return []
    const body = await res.json()
    return body.data ?? []
  }
  const res = await fetch(`/api/v1/companies?q=${encodeURIComponent(q)}&limit=10`)
  if (!res.ok) return []
  const body = await res.json()
  return body.data ?? []
}

export function useCompanySearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetQuery = useCallback(
    debounce((val: string) => setDebouncedQuery(val), 300),
    []
  )

  const handleQueryChange = (val: string) => {
    setQuery(val)
    debouncedSetQuery(val)
  }

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', 'search', debouncedQuery],
    queryFn: () => searchCompanies(debouncedQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes (company list doesn't change often)
  })

  return {
    query,
    setQuery: handleQueryChange,
    companies,
    isLoading,
  }
}
