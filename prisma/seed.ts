// prisma/seed.ts
// Complete seed for the Compensation Intelligence System
// Creates: 10 companies + full level ladders, 10 locations, 8 role taxonomy entries,
// 200 realistic compensation records (varied roles, levels, locations, currencies), 1 admin user

// Load .env file — needed when running via `tsx` which doesn't auto-load env files
import 'dotenv/config'

import { PrismaClient, EquityType, SubmissionSource, SubmissionStatus, EducationLevel, CompanySize, LocationTier, UniversalLevel } from '@prisma/client'
import { normalizeToUSD, getExchangeRate, calculateAnnualizedEquity } from '../lib/compensation-calculator'
import { COMPANY_LEVEL_MAP } from '../lib/level-normalization'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// SEED DATA DEFINITIONS
// ---------------------------------------------------------------------------

const COMPANIES = [
  {
    name: 'Google',
    slug: 'google',
    description: 'Search, cloud, and AI. Known for generous equity and top-tier L5+ compensation.',
    website: 'https://google.com',
    hqCity: 'Mountain View',
    hqCountry: 'US',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'Technology',
    isVerified: true,
  },
  {
    name: 'Meta',
    slug: 'meta',
    description: 'Social media, VR, and AI. Highest equity grants in the industry at E5+.',
    website: 'https://meta.com',
    hqCity: 'Menlo Park',
    hqCountry: 'US',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'Technology',
    isVerified: true,
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    description: 'Cloud (Azure), Office, and gaming. Work-life balance better than FAANG average.',
    website: 'https://microsoft.com',
    hqCity: 'Redmond',
    hqCountry: 'US',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'Technology',
    isVerified: true,
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    description: 'AWS, e-commerce, and logistics. Base salary capped ~$185K; equity-heavy at senior levels.',
    website: 'https://amazon.com',
    hqCity: 'Seattle',
    hqCountry: 'US',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'Technology',
    isVerified: true,
  },
  {
    name: 'Flipkart',
    slug: 'flipkart',
    description: "India's largest e-commerce platform. Competitive Indian product-company compensation.",
    website: 'https://flipkart.com',
    hqCity: 'Bangalore',
    hqCountry: 'IN',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'E-Commerce',
    isVerified: true,
  },
  {
    name: 'Zomato',
    slug: 'zomato',
    description: 'Food delivery and quick commerce. Fast-growing Indian product company.',
    website: 'https://zomato.com',
    hqCity: 'Gurgaon',
    hqCountry: 'IN',
    sizeBand: CompanySize.LARGE_1001_5000,
    industry: 'Food Tech',
    isVerified: true,
  },
  {
    name: 'Swiggy',
    slug: 'swiggy',
    description: 'Food delivery platform. Competes closely with Zomato on engineering talent.',
    website: 'https://swiggy.com',
    hqCity: 'Bangalore',
    hqCountry: 'IN',
    sizeBand: CompanySize.LARGE_1001_5000,
    industry: 'Food Tech',
    isVerified: true,
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    description: 'Indian IT services giant. Band-based compensation system. Lower pay than product companies.',
    website: 'https://infosys.com',
    hqCity: 'Bangalore',
    hqCountry: 'IN',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'IT Services',
    isVerified: true,
  },
  {
    name: 'TCS',
    slug: 'tcs',
    description: 'Tata Consultancy Services. Largest Indian IT company by market cap.',
    website: 'https://tcs.com',
    hqCity: 'Mumbai',
    hqCountry: 'IN',
    sizeBand: CompanySize.ENTERPRISE_5000_PLUS,
    industry: 'IT Services',
    isVerified: true,
  },
  {
    name: 'Stripe',
    slug: 'stripe',
    description: 'Payments infrastructure. Competitive comp; strong engineering culture.',
    website: 'https://stripe.com',
    hqCity: 'San Francisco',
    hqCountry: 'US',
    sizeBand: CompanySize.LARGE_1001_5000,
    industry: 'Fintech',
    isVerified: true,
  },
]

const LOCATIONS = [
  { city: 'Bangalore', state: 'Karnataka', country: 'India', countryCode: 'IN', tier: LocationTier.TIER_2, remoteFriendly: true, slug: 'bangalore-in' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', tier: LocationTier.TIER_2, remoteFriendly: true, slug: 'hyderabad-in' },
  { city: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', tier: LocationTier.TIER_2, remoteFriendly: true, slug: 'pune-in' },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', tier: LocationTier.TIER_2, remoteFriendly: false, slug: 'mumbai-in' },
  { city: 'Gurgaon', state: 'Haryana', country: 'India', countryCode: 'IN', tier: LocationTier.TIER_2, remoteFriendly: true, slug: 'gurgaon-in' },
  { city: 'San Francisco', state: 'California', country: 'United States', countryCode: 'US', tier: LocationTier.TIER_1, remoteFriendly: true, slug: 'san-francisco-us' },
  { city: 'Seattle', state: 'Washington', country: 'United States', countryCode: 'US', tier: LocationTier.TIER_1, remoteFriendly: true, slug: 'seattle-us' },
  { city: 'New York', state: 'New York', country: 'United States', countryCode: 'US', tier: LocationTier.TIER_1, remoteFriendly: false, slug: 'new-york-us' },
  { city: 'Singapore', state: null, country: 'Singapore', countryCode: 'SG', tier: LocationTier.TIER_1, remoteFriendly: true, slug: 'singapore-sg' },
  { city: 'Remote', state: null, country: 'Remote', countryCode: 'US', tier: LocationTier.REMOTE, remoteFriendly: true, slug: 'remote' },
]

const ROLES = [
  { track: 'Engineering', family: 'Software Engineering', specialization: 'Backend', slug: 'engineering-software-backend' },
  { track: 'Engineering', family: 'Software Engineering', specialization: 'Frontend', slug: 'engineering-software-frontend' },
  { track: 'Engineering', family: 'Software Engineering', specialization: 'Full Stack', slug: 'engineering-software-fullstack' },
  { track: 'Engineering', family: 'Infrastructure / Platform', specialization: 'SRE', slug: 'engineering-infra-sre' },
  { track: 'Engineering', family: 'Data & ML', specialization: 'ML Engineering', slug: 'engineering-data-ml' },
  { track: 'Engineering', family: 'Data & ML', specialization: 'Data Engineering', slug: 'engineering-data-engineering' },
  { track: 'Product', family: 'Product Management', specialization: 'Core PM', slug: 'product-pm-core' },
  { track: 'Design', family: 'UX/UI Design', specialization: 'Product Design', slug: 'design-ux-product' },
]

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Starting database seed...')

  // ---- Clean existing data (for idempotent re-seeding) ----
  await prisma.compensation.deleteMany()
  await prisma.companyLevel.deleteMany()
  await prisma.company.deleteMany()
  await prisma.location.deleteMany()
  await prisma.roleTaxonomy.deleteMany()
  await prisma.user.deleteMany()
  console.log('✓ Cleaned existing data')

  // ---- Create Companies ----
  const companyMap = new Map<string, string>() // slug → id
  for (const company of COMPANIES) {
    const created = await prisma.company.create({ data: company })
    companyMap.set(company.slug, created.id)
    console.log(`  + Company: ${company.name}`)
  }

  // ---- Create Company Levels (from our COMPANY_LEVEL_MAP) ----
  for (const [slug, levels] of Object.entries(COMPANY_LEVEL_MAP)) {
    const companyId = companyMap.get(slug)
    if (!companyId) continue

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i]
      await prisma.companyLevel.create({
        data: {
          companyId,
          levelCode: level.levelCode,
          levelName: level.levelName,
          levelOrder: i,
          universalLevel: level.universalLevel as UniversalLevel,
          roleTrack: level.roleTrack ?? null,
        },
      })
    }
    console.log(`  + Levels for: ${slug}`)
  }

  // ---- Create Locations ----
  const locationMap = new Map<string, string>() // slug → id
  for (const location of LOCATIONS) {
    const created = await prisma.location.create({ data: location })
    locationMap.set(location.slug, created.id)
  }
  console.log('✓ Locations created')

  // ---- Create Role Taxonomy ----
  const roleMap = new Map<string, string>() // slug → id
  for (const role of ROLES) {
    const created = await prisma.roleTaxonomy.create({ data: role })
    roleMap.set(role.slug, created.id)
  }
  console.log('✓ Role taxonomy created')

  // ---- Create Admin User ----
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@compintel.dev',
      role: 'ADMIN',
    },
  })
  console.log('✓ Admin user created')

  // ---- Create 200 Compensation Records ----
  console.log('🔄 Seeding 200 compensation records...')

  const records: Array<Parameters<typeof prisma.compensation.create>[0]['data']> = []

  // Helper: get a random item from an array
  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const randNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  // Define compensation ranges per (company, level) pair
  const compRanges: Record<string, Record<string, { baseINR?: [number, number]; baseUSD?: [number, number]; equityUSD?: [number, number]; bonusPct?: number }>> = {
    google: {
      L2: { baseUSD: [150000, 180000], equityUSD: [100000, 200000], bonusPct: 15 },
      L3: { baseUSD: [175000, 210000], equityUSD: [150000, 300000], bonusPct: 15 },
      L4: { baseUSD: [210000, 250000], equityUSD: [250000, 500000], bonusPct: 20 },
      L5: { baseUSD: [250000, 310000], equityUSD: [400000, 900000], bonusPct: 20 },
      L6: { baseUSD: [310000, 400000], equityUSD: [600000, 1500000], bonusPct: 25 },
    },
    meta: {
      L2: { baseUSD: [160000, 190000], equityUSD: [150000, 250000], bonusPct: 10 },
      L3: { baseUSD: [200000, 230000], equityUSD: [200000, 400000], bonusPct: 10 },
      L4: { baseUSD: [230000, 280000], equityUSD: [300000, 600000], bonusPct: 15 },
      L5: { baseUSD: [280000, 350000], equityUSD: [500000, 1200000], bonusPct: 20 },
      L6: { baseUSD: [350000, 450000], equityUSD: [800000, 2000000], bonusPct: 25 },
    },
    amazon: {
      L2: { baseUSD: [130000, 160000], equityUSD: [50000, 150000], bonusPct: 0 },
      L3: { baseUSD: [160000, 185000], equityUSD: [100000, 250000], bonusPct: 0 },
      L4: { baseUSD: [175000, 185000], equityUSD: [200000, 500000], bonusPct: 0 },
      L5: { baseUSD: [180000, 185000], equityUSD: [400000, 900000], bonusPct: 0 },
    },
    microsoft: {
      L2: { baseUSD: [130000, 165000], equityUSD: [80000, 180000], bonusPct: 15 },
      L3: { baseUSD: [165000, 200000], equityUSD: [150000, 350000], bonusPct: 15 },
      L4: { baseUSD: [200000, 240000], equityUSD: [250000, 600000], bonusPct: 20 },
    },
    flipkart: {
      L2: { baseINR: [1500000, 2500000], equityUSD: [10000, 30000], bonusPct: 15 },
      L3: { baseINR: [2500000, 4000000], equityUSD: [30000, 80000], bonusPct: 15 },
      L4: { baseINR: [4000000, 7000000], equityUSD: [80000, 200000], bonusPct: 20 },
      L5: { baseINR: [7000000, 12000000], equityUSD: [150000, 400000], bonusPct: 25 },
    },
    zomato: {
      L2: { baseINR: [1200000, 2000000], equityUSD: [5000, 20000], bonusPct: 10 },
      L3: { baseINR: [2000000, 3500000], equityUSD: [20000, 60000], bonusPct: 15 },
      L4: { baseINR: [3500000, 6000000], equityUSD: [60000, 150000], bonusPct: 15 },
    },
    swiggy: {
      L2: { baseINR: [1200000, 2000000], equityUSD: [5000, 20000], bonusPct: 10 },
      L3: { baseINR: [2000000, 3500000], equityUSD: [20000, 60000], bonusPct: 15 },
      L4: { baseINR: [3500000, 6000000], equityUSD: [60000, 150000], bonusPct: 15 },
    },
    infosys: {
      L1: { baseINR: [300000, 450000], bonusPct: 5 },
      L2: { baseINR: [450000, 700000], bonusPct: 8 },
      L3: { baseINR: [700000, 1200000], bonusPct: 10 },
      L4: { baseINR: [1200000, 2000000], bonusPct: 12 },
      L5: { baseINR: [2000000, 4000000], bonusPct: 15 },
    },
    tcs: {
      L1: { baseINR: [350000, 500000], bonusPct: 5 },
      L2: { baseINR: [500000, 800000], bonusPct: 8 },
      L3: { baseINR: [800000, 1400000], bonusPct: 10 },
      L4: { baseINR: [1400000, 2500000], bonusPct: 12 },
    },
    stripe: {
      L3: { baseUSD: [155000, 190000], equityUSD: [200000, 400000], bonusPct: 10 },
      L4: { baseUSD: [195000, 240000], equityUSD: [350000, 700000], bonusPct: 10 },
      L5: { baseUSD: [240000, 300000], equityUSD: [600000, 1200000], bonusPct: 15 },
    },
  }

  const locationSlugsByCountry = {
    US: ['san-francisco-us', 'seattle-us', 'new-york-us', 'remote'],
    IN: ['bangalore-in', 'hyderabad-in', 'pune-in', 'mumbai-in', 'gurgaon-in'],
    SG: ['singapore-sg'],
  }

  const companyLocationMapping: Record<string, string[]> = {
    google: locationSlugsByCountry.US,
    meta: locationSlugsByCountry.US,
    amazon: locationSlugsByCountry.US,
    microsoft: locationSlugsByCountry.US,
    stripe: locationSlugsByCountry.US,
    flipkart: locationSlugsByCountry.IN,
    zomato: locationSlugsByCountry.IN,
    swiggy: locationSlugsByCountry.IN,
    infosys: locationSlugsByCountry.IN,
    tcs: [...locationSlugsByCountry.IN, ...locationSlugsByCountry.SG],
  }

  const roleIds = Array.from(roleMap.values())
  const educationLevels = [EducationLevel.BACHELOR, EducationLevel.MASTER, EducationLevel.PHD, EducationLevel.BOOTCAMP]
  const equityTypes = [EquityType.RSU, EquityType.RSU, EquityType.RSU, EquityType.OPTIONS] // RSU is 3x more common

  let recordCount = 0
  const targetRecords = 200

  for (const [companySlug, levelRanges] of Object.entries(compRanges)) {
    const companyId = companyMap.get(companySlug)
    if (!companyId) continue

    const locationSlugs = companyLocationMapping[companySlug] ?? locationSlugsByCountry.US
    const currency = companySlug === 'google' || companySlug === 'meta' || companySlug === 'amazon' ||
      companySlug === 'microsoft' || companySlug === 'stripe' ? 'USD' : 'INR'

    const levelsForCompany = Object.entries(levelRanges)
    const recordsPerLevel = Math.max(2, Math.floor(targetRecords / (Object.keys(compRanges).length * levelsForCompany.length)))

    for (const [universalLevelCode, ranges] of levelsForCompany) {
      for (let i = 0; i < recordsPerLevel && recordCount < targetRecords; i++) {
        const locationSlug = rand(locationSlugs)
        const locationId = locationMap.get(locationSlug)
        if (!locationId) continue

        const roleId = rand(roleIds)
        const education = rand(educationLevels)
        const equityType = ranges.equityUSD ? rand(equityTypes) : EquityType.NONE

        let baseSalaryLocal: number
        let baseSalaryUsd: number
        let exchangeRate: number

        if (ranges.baseUSD) {
          baseSalaryLocal = randNum(ranges.baseUSD[0], ranges.baseUSD[1])
          baseSalaryUsd = baseSalaryLocal
          exchangeRate = 1
        } else if (ranges.baseINR) {
          baseSalaryLocal = randNum(ranges.baseINR[0], ranges.baseINR[1])
          exchangeRate = getExchangeRate('INR')
          baseSalaryUsd = normalizeToUSD(baseSalaryLocal, 'INR')
        } else {
          continue
        }

        const equityTotalUsd = ranges.equityUSD
          ? randNum(ranges.equityUSD[0], ranges.equityUSD[1])
          : null
        const equityAnnualUsd = equityTotalUsd ? calculateAnnualizedEquity(equityTotalUsd) : null
        const annualBonusPct = ranges.bonusPct ?? 0
        const annualBonusActualUsd = annualBonusPct > 0
          ? Math.round(baseSalaryUsd * (annualBonusPct / 100) * (0.8 + Math.random() * 0.4))
          : 0

        const totalCompUsd = baseSalaryUsd + annualBonusActualUsd + (equityAnnualUsd ?? 0)

        const yoeTotal = randNum(
          universalLevelCode === 'L1' ? 0 : universalLevelCode === 'L2' ? 0 : universalLevelCode === 'L3' ? 2 :
          universalLevelCode === 'L4' ? 5 : universalLevelCode === 'L5' ? 7 : 10,
          universalLevelCode === 'L1' ? 1 : universalLevelCode === 'L2' ? 3 : universalLevelCode === 'L3' ? 6 :
          universalLevelCode === 'L4' ? 10 : universalLevelCode === 'L5' ? 15 : 20
        )

        // Random effective date in last 2 years
        const effectiveDateOffset = randNum(0, 730)
        const effectiveDate = new Date()
        effectiveDate.setDate(effectiveDate.getDate() - effectiveDateOffset)

        await prisma.compensation.create({
          data: {
            companyId,
            locationId,
            roleId,
            jobTitle: rand(['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Backend Engineer', 'Frontend Engineer', 'Platform Engineer']),
            universalLevel: universalLevelCode as UniversalLevel,
            baseSalaryLocal,
            baseSalaryUsd,
            currency,
            exchangeRateUsed: exchangeRate,
            annualBonusTargetPct: annualBonusPct,
            annualBonusActualUsd: annualBonusActualUsd > 0 ? annualBonusActualUsd : null,
            equityTotalUsd,
            equityType,
            equityVestingYears: 4,
            equityCliffMonths: 12,
            equityAnnualUsd,
            totalCompUsd,
            yoeTotal,
            yoeAtCompany: randNum(0, Math.min(yoeTotal, 5)),
            education,
            isNewOffer: Math.random() > 0.5,
            source: SubmissionSource.SELF,
            verified: Math.random() > 0.7,
            status: SubmissionStatus.APPROVED,
            effectiveDate,
            reviewedBy: adminUser.id,
            reviewedAt: new Date(),
          },
        })

        recordCount++
      }
    }
  }

  console.log(`✓ Created ${recordCount} compensation records`)
  console.log('✅ Seed complete!')
}

// ---------------------------------------------------------------------------
// RUN
// ---------------------------------------------------------------------------

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
