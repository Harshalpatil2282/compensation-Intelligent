export const dynamic = 'force-dynamic'

// app/api/v1/compensation/route.ts
// GET: Search/filter compensation records
// POST: Submit a new compensation record

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { compensationRepository } from '@/features/compensation/repository'
import { CompensationQuerySchema, CompensationSubmitSchema } from '@/features/compensation/schema'
import {
  success,
  created,
  validationError,
  internalError,
} from '@/lib/api-response'

// ---------------------------------------------------------------------------
// GET /api/v1/compensation
// Search and filter compensation records with pagination
// Public endpoint (returns APPROVED records only)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawParams = Object.fromEntries(searchParams.entries())

    const parsed = CompensationQuerySchema.safeParse(rawParams)
    if (!parsed.success) {
      return validationError(parsed.error.flatten())
    }

    const result = await compensationRepository.findMany(parsed.data)

    return success(result.data, result.meta)
  } catch (err) {
    console.error('[GET /api/v1/compensation]', err)
    return internalError()
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/compensation
// Submit a new compensation record
// Auth: optional (anonymous submissions allowed)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()

    const parsed = CompensationSubmitSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(parsed.error.flatten())
    }

    // Anonymous submissions are allowed — userId will be null
    const userId = session?.user?.id ?? undefined

    const record = await compensationRepository.submitCompensation(parsed.data, userId)

    return created(record)
  } catch (err) {
    console.error('[POST /api/v1/compensation]', err)
    return internalError()
  }
}

