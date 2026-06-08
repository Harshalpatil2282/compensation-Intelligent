// app/api/v1/compensation/[id]/route.ts
// GET /api/v1/compensation/:id — get a single compensation record by ID

import { NextRequest } from 'next/server'
import { compensationRepository } from '@/features/compensation/repository'
import { notFound, success, internalError } from '@/lib/api-response'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await compensationRepository.findById(params.id)

    if (!record || record.status !== 'APPROVED') {
      return notFound('Compensation record')
    }

    return success(record)
  } catch (err) {
    console.error('[GET /api/v1/compensation/:id]', err)
    return internalError()
  }
}
