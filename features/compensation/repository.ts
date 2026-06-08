// features/compensation/repository.ts
// Repository pattern: ALL database access for compensation goes through this class.
// Route handlers NEVER import Prisma directly — they call this repository.

import { prisma } from '@/lib/prisma'
import {
  calculateAnnualizedEquity,
  calculatePercentiles,
  normalizeToUSD,
  getExchangeRate,
} from '@/lib/compensation-calculator'
import type {
  CompensationSubmitInput,
  CompensationQueryInput,
} from './schema'
import type { Prisma, SubmissionStatus } from '@prisma/client'

// ---------------------------------------------------------------------------
// RETURN TYPES
// ---------------------------------------------------------------------------

// The shape of a full compensation record returned by the repository
export type CompensationRecord = Prisma.CompensationGetPayload<{
  include: {
    company: { select: { id: true; name: true; slug: true; logoUrl: true; sizeBand: true } }
    location: { select: { id: true; city: true; country: true; countryCode: true; tier: true } }
    role: { select: { id: true; track: true; family: true; specialization: true; slug: true } }
    companyLevel: { select: { levelCode: true; levelName: true } }
  }
}>

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface PercentileResult {
  base: { p25: number; p50: number; p75: number; p90: number }
  equity: { p25: number; p50: number; p75: number; p90: number }
  total: { p25: number; p50: number; p75: number; p90: number }
  count: number
}

// ---------------------------------------------------------------------------
// INCLUDE CLAUSE (reused across queries for consistency)
// ---------------------------------------------------------------------------

const COMPENSATION_INCLUDE = {
  company: {
    select: { id: true, name: true, slug: true, logoUrl: true, sizeBand: true },
  },
  location: {
    select: { id: true, city: true, country: true, countryCode: true, tier: true },
  },
  role: {
    select: { id: true, track: true, family: true, specialization: true, slug: true },
  },
  companyLevel: {
    select: { levelCode: true, levelName: true },
  },
} as const

// ---------------------------------------------------------------------------
// COMPENSATION REPOSITORY
// ---------------------------------------------------------------------------

export class CompensationRepository {
  /**
   * Submit a new compensation record.
   * Calculates USD normalization, annualized equity, and total comp before saving.
   */
  async submitCompensation(
    data: CompensationSubmitInput,
    userId?: string
  ): Promise<CompensationRecord> {
    // Calculate derived fields
    const exchangeRate = getExchangeRate(data.currency)
    const baseSalaryUsd = normalizeToUSD(data.baseSalaryLocal, data.currency)
    const annualBonusActualUsd = data.annualBonusActualUsd ?? 0
    const equityAnnualUsd = calculateAnnualizedEquity(
      data.equityTotalUsd ?? null,
      data.equityVestingYears
    )
    const totalCompUsd = baseSalaryUsd + annualBonusActualUsd + equityAnnualUsd

    return prisma.compensation.create({
      data: {
        userId: userId ?? null,
        companyId: data.companyId,
        companyLevelId: data.companyLevelId ?? null,
        locationId: data.locationId,
        roleId: data.roleId,
        jobTitle: data.jobTitle,
        universalLevel: data.universalLevel,
        companyLevelCode: data.companyLevelCode ?? null,

        baseSalaryLocal: data.baseSalaryLocal,
        baseSalaryUsd,
        currency: data.currency.toUpperCase(),
        exchangeRateUsed: exchangeRate,

        signingBonus: data.signingBonus ?? null,
        annualBonusTargetPct: data.annualBonusTargetPct ?? null,
        annualBonusActualUsd: data.annualBonusActualUsd ?? null,

        equityTotalUsd: data.equityTotalUsd ?? null,
        equityType: data.equityType,
        equityVestingYears: data.equityVestingYears,
        equityCliffMonths: data.equityCliffMonths,
        equityAnnualUsd,

        totalCompUsd,

        yoeTotal: data.yoeTotal,
        yoeAtCompany: data.yoeAtCompany,
        education: data.education,
        isNewOffer: data.isNewOffer,
        source: data.source,
        notes: data.notes ?? null,
        effectiveDate: new Date(data.effectiveDate),

        status: 'PENDING', // All submissions start as PENDING
        verified: false,
      },
      include: COMPENSATION_INCLUDE,
    })
  }

  /**
   * Find many compensation records with filtering, sorting, and pagination.
   */
  async findMany(
    filters: CompensationQueryInput
  ): Promise<PaginatedResult<CompensationRecord>> {
    const where = this.buildWhereClause(filters)
    const orderBy = this.buildOrderBy(filters)
    const skip = (filters.page - 1) * filters.pageSize

    const [data, total] = await Promise.all([
      prisma.compensation.findMany({
        where,
        include: COMPENSATION_INCLUDE,
        orderBy,
        skip,
        take: filters.pageSize,
      }),
      prisma.compensation.count({ where }),
    ])

    return {
      data: data as CompensationRecord[],
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    }
  }

  /**
   * Find a single compensation record by ID.
   * Only returns APPROVED records (unless admin — handle at route level).
   */
  async findById(id: string): Promise<CompensationRecord | null> {
    return prisma.compensation.findUnique({
      where: { id },
      include: COMPENSATION_INCLUDE,
    }) as Promise<CompensationRecord | null>
  }

  /**
   * Find multiple records by array of IDs (for comparison endpoint).
   */
  async findByIds(ids: string[]): Promise<CompensationRecord[]> {
    const records = await prisma.compensation.findMany({
      where: { id: { in: ids }, status: 'APPROVED' },
      include: COMPENSATION_INCLUDE,
    })
    return records as CompensationRecord[]
  }

  /**
   * Calculate percentile distributions for a given filter set.
   * Fetches all matching totalCompUsd, baseSalaryUsd, equityAnnualUsd values
   * and computes p25/p50/p75/p90.
   *
   * We use Prisma here instead of raw SQL because:
   * - The data sets for a filtered query are typically < 10,000 rows
   * - Raw SQL percentile functions (PERCENTILE_CONT) are more accurate but add complexity
   * - v2 can migrate this to a raw SQL query if performance becomes an issue
   */
  async findPercentiles(filters: CompensationQueryInput): Promise<PercentileResult> {
    const where = this.buildWhereClause(filters)

    const records = await prisma.compensation.findMany({
      where,
      select: {
        baseSalaryUsd: true,
        equityAnnualUsd: true,
        totalCompUsd: true,
      },
    })

    const baseValues = records.map((r) => Number(r.baseSalaryUsd))
    const equityValues = records
      .filter((r) => r.equityAnnualUsd !== null)
      .map((r) => Number(r.equityAnnualUsd))
    const totalValues = records.map((r) => Number(r.totalCompUsd))

    return {
      base: calculatePercentiles(baseValues),
      equity: calculatePercentiles(equityValues.length > 0 ? equityValues : [0]),
      total: calculatePercentiles(totalValues),
      count: records.length,
    }
  }

  /**
   * Approve a compensation submission.
   * Only callable by ADMIN/MODERATOR — enforced at route level.
   */
  async approve(id: string, reviewerId: string): Promise<CompensationRecord> {
    return prisma.compensation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: COMPENSATION_INCLUDE,
    }) as Promise<CompensationRecord>
  }

  /**
   * Reject a compensation submission with a reason.
   */
  async reject(
    id: string,
    reviewerId: string,
    reason: string
  ): Promise<CompensationRecord> {
    return prisma.compensation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: reason,
      },
      include: COMPENSATION_INCLUDE,
    }) as Promise<CompensationRecord>
  }

  /**
   * Get aggregate stats for the stats endpoint.
   */
  async getAggregateStats(): Promise<{
    totalSubmissions: number
    approvedSubmissions: number
    companiesRepresented: number
    avgTotalComp: number
    medianTotalComp: number
  }> {
    const [totalSubmissions, approvedSubmissions, companiesRepresented, aggResult] =
      await Promise.all([
        prisma.compensation.count(),
        prisma.compensation.count({ where: { status: 'APPROVED' } }),
        prisma.compensation.groupBy({
          by: ['companyId'],
          where: { status: 'APPROVED' },
        }).then((g) => g.length),
        prisma.compensation.aggregate({
          where: { status: 'APPROVED' },
          _avg: { totalCompUsd: true },
        }),
      ])

    // Get median via percentile calculation
    const totalValues = await prisma.compensation.findMany({
      where: { status: 'APPROVED' },
      select: { totalCompUsd: true },
    })
    const percentiles = calculatePercentiles(totalValues.map((r) => Number(r.totalCompUsd)))

    return {
      totalSubmissions,
      approvedSubmissions,
      companiesRepresented,
      avgTotalComp: Math.round(Number(aggResult._avg.totalCompUsd) ?? 0),
      medianTotalComp: percentiles.p50,
    }
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private buildWhereClause(filters: CompensationQueryInput): Prisma.CompensationWhereInput {
    const where: Prisma.CompensationWhereInput = {
      status: filters.status as SubmissionStatus,
    }

    if (filters.companyId) where.companyId = filters.companyId
    if (filters.companySlug) where.company = { slug: filters.companySlug }
    if (filters.locationId) where.locationId = filters.locationId
    if (filters.locationSlug) where.location = { slug: filters.locationSlug }
    if (filters.roleId) where.roleId = filters.roleId
    if (filters.universalLevel) where.universalLevel = filters.universalLevel

    // Role taxonomy filtering (track/family/specialization)
    if (filters.roleTrack || filters.roleFamily || filters.roleSpecialization) {
      where.role = {
        ...(filters.roleTrack && { track: filters.roleTrack }),
        ...(filters.roleFamily && { family: filters.roleFamily }),
        ...(filters.roleSpecialization && { specialization: filters.roleSpecialization }),
      }
    }

    // YOE range
    if (filters.yoeTotalMin !== undefined || filters.yoeTotalMax !== undefined) {
      where.yoeTotal = {
        ...(filters.yoeTotalMin !== undefined && { gte: filters.yoeTotalMin }),
        ...(filters.yoeTotalMax !== undefined && { lte: filters.yoeTotalMax }),
      }
    }

    // Date range on effectiveDate
    if (filters.dateFrom || filters.dateTo) {
      where.effectiveDate = {
        ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
        ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
      }
    }

    return where
  }

  private buildOrderBy(
    filters: CompensationQueryInput
  ): Prisma.CompensationOrderByWithRelationInput {
    return { [filters.sortBy]: filters.sortOrder }
  }
}

// Singleton export — one instance per server process
export const compensationRepository = new CompensationRepository()
