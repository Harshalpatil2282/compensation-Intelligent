export const dynamic = 'force-dynamic'

// app/api/v1/levels/route.ts
// GET /api/v1/levels?companyId=xxx — get level taxonomy for a company
// Returns company-specific levels mapped to universal levels

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, validationError, internalError } from '@/lib/api-response'
import { z } from 'zod'
import { UNIVERSAL_LEVELS } from '@/lib/level-normalization'

const LevelsQuerySchema = z.object({
  companyId: z.string().cuid().optional(),
  companySlug: z.string().max(100).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = LevelsQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

    if (!parsed.success) {
      return validationError(parsed.error.flatten())
    }

    const { companyId, companySlug } = parsed.data

    // If no company filter, return the universal level taxonomy
    if (!companyId && !companySlug) {
      const universalLevels = Object.values(UNIVERSAL_LEVELS).map((lvl) => ({
        code: lvl.code,
        title: lvl.title,
        description: lvl.description,
        order: lvl.order,
        minYoe: lvl.minYoe,
        maxYoe: lvl.maxYoe,
      }))
      return success(universalLevels)
    }

    // Return company-specific levels with their universal mappings
    const company = await prisma.company.findFirst({
      where: companyId ? { id: companyId } : { slug: companySlug },
      include: {
        levels: {
          orderBy: { levelOrder: 'asc' },
        },
      },
    })

    if (!company) {
      return success([])
    }

    const levels = company.levels.map((lvl) => ({
      id: lvl.id,
      levelCode: lvl.levelCode,
      levelName: lvl.levelName,
      levelOrder: lvl.levelOrder,
      universalLevel: lvl.universalLevel,
      universalLevelInfo: UNIVERSAL_LEVELS[lvl.universalLevel],
      roleTrack: lvl.roleTrack,
    }))

    return success(levels)
  } catch (err) {
    console.error('[GET /api/v1/levels]', err)
    return internalError()
  }
}

