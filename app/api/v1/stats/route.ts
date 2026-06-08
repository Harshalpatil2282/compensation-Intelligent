export const dynamic = 'force-dynamic'

// app/api/v1/stats/route.ts
// GET /api/v1/stats — aggregate statistics for the landing page and dashboard

import { NextRequest } from 'next/server'
import { compensationRepository } from '@/features/compensation/repository'
import { CompensationQuerySchema } from '@/features/compensation/schema'
import { success, internalError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawParams = Object.fromEntries(searchParams.entries())

    // Check if caller wants percentiles for a specific filter set
    const hasFilters = searchParams.has('companyId') || searchParams.has('roleId') || searchParams.has('universalLevel')

    if (hasFilters) {
      const parsed = CompensationQuerySchema.safeParse({
        ...rawParams,
        status: 'APPROVED',
      })
      if (!parsed.success) {
        return success({ percentiles: null, aggregate: null })
      }
      const percentiles = await compensationRepository.findPercentiles(parsed.data)
      return success({ percentiles, aggregate: null })
    }

    // Global aggregate stats (for landing page)
    const aggregate = await compensationRepository.getAggregateStats()
    return success({ aggregate, percentiles: null })
  } catch (err) {
    console.error('[GET /api/v1/stats]', err)
    return internalError()
  }
}

