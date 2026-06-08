export const dynamic = 'force-dynamic'

// app/api/v1/compare/route.ts
// POST /api/v1/compare — compare 2–4 compensation records or ad-hoc offers

import { NextRequest } from 'next/server'
import { compensationRepository } from '@/features/compensation/repository'
import { CompareRequestSchema } from '@/features/compensation/schema'
import { validationError, success, internalError } from '@/lib/api-response'
import { levelNormalizer, UNIVERSAL_LEVELS } from '@/lib/level-normalization'
import {
  calculateTotalComp,
  normalizeToUSD,
} from '@/lib/compensation-calculator'

// Result type for comparison
export interface OfferComparisonItem {
  label: string
  companyName: string
  companySlug: string
  levelCode: string
  universalLevel: string
  universalLevelTitle: string
  baseSalaryUsd: number
  annualBonusUsd: number
  annualEquityUsd: number
  totalCompUsd: number
  breakdown: {
    basePercent: number
    bonusPercent: number
    equityPercent: number
  }
}

export interface ComparisonResult {
  offers: OfferComparisonItem[]
  winner: {
    base: string   // label of the winning offer
    equity: string
    total: string
  }
  levelWarnings: string[]
  deltas: Array<{
    pair: [string, string] // offer labels
    totalDeltaUsd: number
    totalDeltaPct: number
  }>
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CompareRequestSchema.safeParse(body)

    if (!parsed.success) {
      return validationError(parsed.error.flatten())
    }

    const { ids, offers: adHocOffers } = parsed.data
    const items: OfferComparisonItem[] = []
    const levelWarnings: string[] = []

    // —— Handle DB record IDs ——
    if (ids && ids.length > 0) {
      const records = await compensationRepository.findByIds(ids)

      for (const record of records) {
        const tc = calculateTotalComp(
          Number(record.baseSalaryUsd),
          Number(record.annualBonusActualUsd ?? 0),
          record.equityTotalUsd ? Number(record.equityTotalUsd) : null,
          record.equityVestingYears
        )

        const levelInfo = UNIVERSAL_LEVELS[record.universalLevel]

        items.push({
          label: `${record.company.name} – ${record.companyLevelCode ?? record.universalLevel}`,
          companyName: record.company.name,
          companySlug: record.company.slug,
          levelCode: record.companyLevelCode ?? record.universalLevel,
          universalLevel: record.universalLevel,
          universalLevelTitle: levelInfo?.title ?? record.universalLevel,
          baseSalaryUsd: tc.baseSalaryUsd,
          annualBonusUsd: tc.annualBonusUsd,
          annualEquityUsd: tc.annualEquityUsd,
          totalCompUsd: tc.totalCompUsd,
          breakdown: tc.breakdown,
        })
      }
    }

    // —— Handle ad-hoc offers ——
    if (adHocOffers && adHocOffers.length > 0) {
      for (const offer of adHocOffers) {
        const tc = calculateTotalComp(
          offer.baseSalaryUsd,
          offer.annualBonusUsd ?? 0,
          offer.equityTotalUsd ?? null,
          offer.equityVestingYears ?? 4
        )

        const universalLevel =
          levelNormalizer.normalizeToUniversal(offer.companySlug, offer.levelCode) ?? 'L4'
        const levelInfo = UNIVERSAL_LEVELS[universalLevel]

        items.push({
          label: offer.label,
          companyName: offer.companySlug,
          companySlug: offer.companySlug,
          levelCode: offer.levelCode,
          universalLevel,
          universalLevelTitle: levelInfo?.title ?? universalLevel,
          baseSalaryUsd: tc.baseSalaryUsd,
          annualBonusUsd: tc.annualBonusUsd,
          annualEquityUsd: tc.annualEquityUsd,
          totalCompUsd: tc.totalCompUsd,
          breakdown: tc.breakdown,
        })
      }
    }

    // —— Detect level mismatches across all pairs ——
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        const comparison = levelNormalizer.compareLevels(
          { companySlug: a.companySlug, levelCode: a.levelCode },
          { companySlug: b.companySlug, levelCode: b.levelCode }
        )
        if (comparison.isMismatched && comparison.warning) {
          levelWarnings.push(comparison.warning)
        }
      }
    }

    // —— Calculate winner on each dimension ——
    const maxBase = items.reduce((best, item) =>
      item.baseSalaryUsd > best.baseSalaryUsd ? item : best
    )
    const maxEquity = items.reduce((best, item) =>
      item.annualEquityUsd > best.annualEquityUsd ? item : best
    )
    const maxTotal = items.reduce((best, item) =>
      item.totalCompUsd > best.totalCompUsd ? item : best
    )

    // —— Compute pairwise deltas ——
    const deltas = []
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        const delta = b.totalCompUsd - a.totalCompUsd
        const baseDenom = a.totalCompUsd || 1
        deltas.push({
          pair: [a.label, b.label] as [string, string],
          totalDeltaUsd: Math.round(delta),
          totalDeltaPct: Math.round((delta / baseDenom) * 100),
        })
      }
    }

    const result: ComparisonResult = {
      offers: items,
      winner: {
        base: maxBase.label,
        equity: maxEquity.label,
        total: maxTotal.label,
      },
      levelWarnings,
      deltas,
    }

    return success(result)
  } catch (err) {
    console.error('[POST /api/v1/compare]', err)
    return internalError()
  }
}

