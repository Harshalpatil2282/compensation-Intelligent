// features/compensation/hooks/useSubmitCompensation.ts
// TanStack Query mutation for submitting a compensation record

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CompensationSubmitInput } from '../schema'

async function submitCompensation(data: CompensationSubmitInput) {
  const res = await fetch('/api/v1/compensation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error?.message ?? 'Submission failed')
  }
  return res.json()
}

export function useSubmitCompensation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitCompensation,
    onSuccess: () => {
      // Invalidate explore query so new data appears
      queryClient.invalidateQueries({ queryKey: ['compensation'] })
    },
  })
}
