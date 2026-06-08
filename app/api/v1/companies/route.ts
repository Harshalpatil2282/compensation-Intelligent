export const dynamic = 'force-dynamic'

// app/api/v1/companies/route.ts
// GET /api/v1/companies?q=goo — autocomplete company search
// Returns top 10 matches for combobox use

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, internalError } from '@/lib/api-response'
import { z } from 'zod'

const SearchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = SearchSchema.safeParse(Object.fromEntries(searchParams.entries()))

    if (!parsed.success) {
      return success([])
    }

    const { q, limit } = parsed.data

    const companies = await prisma.company.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        sizeBand: true,
        industry: true,
        hqCountry: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    })

    return success(companies)
  } catch (err) {
    console.error('[GET /api/v1/companies]', err)
    return internalError()
  }
}

