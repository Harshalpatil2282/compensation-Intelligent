// features/compensation/schema.ts
// Zod schemas for the compensation feature.
// These are the SINGLE SOURCE OF TRUTH for all data shapes.
// The Prisma types are derived from the DB; Zod validates the API boundary.

import { z } from 'zod'

// ---------------------------------------------------------------------------
// ENUMS (mirroring Prisma schema enums)
// ---------------------------------------------------------------------------

export const EquityTypeEnum = z.enum(['RSU', 'OPTIONS', 'PHANTOM', 'ESOP', 'NONE'])
export const SubmissionSourceEnum = z.enum(['SELF', 'OFFER_LETTER', 'PUBLIC'])
export const SubmissionStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export const EducationLevelEnum = z.enum([
  'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', 'BOOTCAMP', 'SELF_TAUGHT', 'OTHER',
])
export const UniversalLevelEnum = z.enum(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'])

// ---------------------------------------------------------------------------
// COMPENSATION SUBMIT SCHEMA
// Used to validate POST /api/v1/compensation requests
// ---------------------------------------------------------------------------

export const CompensationSubmitSchema = z.object({
  // Company + Role
  companyId: z.string().cuid('Invalid company ID'),
  companyLevelId: z.string().cuid().optional(),
  locationId: z.string().cuid('Invalid location ID'),
  roleId: z.string().cuid('Invalid role ID'),
  jobTitle: z.string().min(2).max(120).trim(),
  universalLevel: UniversalLevelEnum,
  companyLevelCode: z.string().max(50).optional(),

  // Base salary
  baseSalaryLocal: z
    .number()
    .positive('Base salary must be positive')
    .max(100_000_000, 'Base salary seems unrealistically high'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO 4217 code')
    .toUpperCase(),

  // Bonus
  signingBonus: z.number().nonnegative().max(10_000_000).optional(),
  annualBonusTargetPct: z
    .number()
    .nonnegative()
    .max(500, 'Bonus target cannot exceed 500%')
    .optional(),
  annualBonusActualUsd: z.number().nonnegative().max(10_000_000).optional(),

  // Equity
  equityTotalUsd: z.number().nonnegative().max(100_000_000).optional(),
  equityType: EquityTypeEnum.default('NONE'),
  equityVestingYears: z.number().int().min(1).max(10).default(4),
  equityCliffMonths: z.number().int().min(0).max(24).default(12),

  // Experience
  yoeTotal: z.number().int().min(0).max(50),
  yoeAtCompany: z.number().int().min(0).max(50).default(0),

  // Context
  education: EducationLevelEnum.default('BACHELOR'),
  isNewOffer: z.boolean().default(true),
  source: SubmissionSourceEnum.default('SELF'),
  notes: z.string().max(1000).optional(),

  // Effective date of this compensation (offer date or current date)
  effectiveDate: z.string().datetime({ message: 'effectiveDate must be ISO 8601' }),
}).refine(
  (data) => data.yoeAtCompany <= data.yoeTotal,
  {
    message: 'Years at company cannot exceed total years of experience',
    path: ['yoeAtCompany'],
  }
).refine(
  (data) => {
    // Equity cliff cannot exceed vesting period
    if (data.equityCliffMonths && data.equityVestingYears) {
      return data.equityCliffMonths <= data.equityVestingYears * 12
    }
    return true
  },
  {
    message: 'Equity cliff cannot be longer than the total vesting period',
    path: ['equityCliffMonths'],
  }
)

export type CompensationSubmitInput = z.infer<typeof CompensationSubmitSchema>

// ---------------------------------------------------------------------------
// COMPENSATION QUERY SCHEMA
// Used to validate GET /api/v1/compensation query parameters
// ---------------------------------------------------------------------------

export const CompensationQuerySchema = z.object({
  // Filters
  companyId: z.string().cuid().optional(),
  companySlug: z.string().max(100).optional(),
  roleTrack: z.string().max(100).optional(),
  roleFamily: z.string().max(100).optional(),
  roleSpecialization: z.string().max(100).optional(),
  roleId: z.string().cuid().optional(),
  locationId: z.string().cuid().optional(),
  locationSlug: z.string().max(100).optional(),
  universalLevel: UniversalLevelEnum.optional(),
  currency: z.string().length(3).optional(),
  status: SubmissionStatusEnum.optional().default('APPROVED'),

  // YOE range
  yoeTotalMin: z.coerce.number().int().min(0).max(50).optional(),
  yoeTotalMax: z.coerce.number().int().min(0).max(50).optional(),

  // Date range
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),

  // Sorting
  sortBy: z
    .enum(['totalCompUsd', 'baseSalaryUsd', 'submittedAt', 'yoeTotal'])
    .default('totalCompUsd'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).refine(
  (data) => {
    if (data.yoeTotalMin !== undefined && data.yoeTotalMax !== undefined) {
      return data.yoeTotalMin <= data.yoeTotalMax
    }
    return true
  },
  {
    message: 'yoeTotalMin must be <= yoeTotalMax',
    path: ['yoeTotalMin'],
  }
)

export type CompensationQueryInput = z.infer<typeof CompensationQuerySchema>

// ---------------------------------------------------------------------------
// COMPENSATION RESPONSE SCHEMA
// What we return to the frontend — never expose raw DB records
// ---------------------------------------------------------------------------

export const CompensationResponseSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  universalLevel: UniversalLevelEnum,
  companyLevelCode: z.string().optional().nullable(),

  // Company (partial)
  company: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string().optional().nullable(),
    sizeBand: z.string(),
  }),

  // Location (partial)
  location: z.object({
    id: z.string(),
    city: z.string(),
    country: z.string(),
    countryCode: z.string(),
    tier: z.string(),
  }),

  // Role (partial)
  role: z.object({
    id: z.string(),
    track: z.string(),
    family: z.string(),
    specialization: z.string(),
    slug: z.string(),
  }),

  // Compensation numbers (always in USD for comparability)
  baseSalaryUsd: z.number(),
  signingBonus: z.number().optional().nullable(),
  annualBonusTargetPct: z.number().optional().nullable(),
  annualBonusActualUsd: z.number().optional().nullable(),
  equityTotalUsd: z.number().optional().nullable(),
  equityAnnualUsd: z.number().optional().nullable(),
  equityType: EquityTypeEnum,
  equityVestingYears: z.number(),
  totalCompUsd: z.number(),

  // Original currency (for display)
  currency: z.string(),
  baseSalaryLocal: z.number(),

  // Experience
  yoeTotal: z.number(),
  yoeAtCompany: z.number(),

  // Context
  education: EducationLevelEnum,
  isNewOffer: z.boolean(),
  source: SubmissionSourceEnum,
  verified: z.boolean(),

  // Dates
  effectiveDate: z.string(),
  submittedAt: z.string(),
})

export type CompensationResponse = z.infer<typeof CompensationResponseSchema>

// ---------------------------------------------------------------------------
// PERCENTILE RESPONSE SCHEMA
// ---------------------------------------------------------------------------

export const PercentileResponseSchema = z.object({
  base: z.object({ p25: z.number(), p50: z.number(), p75: z.number(), p90: z.number() }),
  equity: z.object({ p25: z.number(), p50: z.number(), p75: z.number(), p90: z.number() }),
  total: z.object({ p25: z.number(), p50: z.number(), p75: z.number(), p90: z.number() }),
  count: z.number(),
})

export type PercentileResponse = z.infer<typeof PercentileResponseSchema>

// ---------------------------------------------------------------------------
// COMPARE ENDPOINT SCHEMA
// ---------------------------------------------------------------------------

export const CompareRequestSchema = z.object({
  // Compare by IDs (existing records)
  ids: z.array(z.string().cuid()).max(4).optional(),
  // Or compare ad-hoc offers (not in DB)
  offers: z
    .array(
      z.object({
        label: z.string().max(100), // e.g., "Google L5 Offer", "Current Job"
        companySlug: z.string().max(100),
        levelCode: z.string().max(50),
        baseSalaryUsd: z.number().positive(),
        annualBonusUsd: z.number().nonnegative().optional(),
        equityTotalUsd: z.number().nonnegative().optional(),
        equityVestingYears: z.number().int().min(1).max(10).optional(),
      })
    )
    .max(4)
    .optional(),
}).refine(
  (data) => (data.ids?.length ?? 0) + (data.offers?.length ?? 0) >= 2,
  { message: 'Must provide at least 2 offers or IDs to compare' }
)

export type CompareRequestInput = z.infer<typeof CompareRequestSchema>
