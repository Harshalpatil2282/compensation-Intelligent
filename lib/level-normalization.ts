// lib/level-normalization.ts
// Universal Level Normalization Engine
// The core intellectual component: maps company-specific levels to L1–L9
// and provides cross-company comparison with level-mismatch detection.

// ---------------------------------------------------------------------------
// UNIVERSAL LEVEL ENUM (mirrors Prisma schema)
// ---------------------------------------------------------------------------

export type UniversalLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9'

export interface UniversalLevelInfo {
  code: UniversalLevel
  order: number          // 1-9 for easy numeric comparison
  title: string          // Canonical title
  description: string    // What this level means
  minYoe: number         // Typical minimum YOE
  maxYoe: number         // Typical maximum YOE (0 = no cap)
}

export const UNIVERSAL_LEVELS: Record<UniversalLevel, UniversalLevelInfo> = {
  L1: {
    code: 'L1',
    order: 1,
    title: 'Intern',
    description: 'Internship / co-op position. Not full-time.',
    minYoe: 0,
    maxYoe: 1,
  },
  L2: {
    code: 'L2',
    order: 2,
    title: 'Junior / Entry-Level',
    description: 'New grad or early-career professional. Requires close mentorship.',
    minYoe: 0,
    maxYoe: 3,
  },
  L3: {
    code: 'L3',
    order: 3,
    title: 'Mid-Level',
    description: 'Independent contributor. Owns features end-to-end. Some mentoring.',
    minYoe: 2,
    maxYoe: 6,
  },
  L4: {
    code: 'L4',
    order: 4,
    title: 'Senior',
    description: 'Technical lead for features. Designs systems. Mentors L2/L3.',
    minYoe: 5,
    maxYoe: 10,
  },
  L5: {
    code: 'L5',
    order: 5,
    title: 'Staff / Lead',
    description: 'Cross-team technical influence. Drives large initiatives. Often a force multiplier.',
    minYoe: 7,
    maxYoe: 15,
  },
  L6: {
    code: 'L6',
    order: 6,
    title: 'Senior Staff / Senior Principal',
    description: 'Org-wide technical strategy. Defines engineering culture. Rarely IC-only.',
    minYoe: 10,
    maxYoe: 20,
  },
  L7: {
    code: 'L7',
    order: 7,
    title: 'Principal / Distinguished',
    description: 'Industry-recognized technical leader. Shapes company-wide or product-wide roadmap.',
    minYoe: 12,
    maxYoe: 0,
  },
  L8: {
    code: 'L8',
    order: 8,
    title: 'Fellow / VP Engineering',
    description: 'A handful at any company. Sets technical direction for the company or major org.',
    minYoe: 15,
    maxYoe: 0,
  },
  L9: {
    code: 'L9',
    order: 9,
    title: 'Distinguished Fellow / SVP Engineering',
    description: 'Extremely rare. Equivalent to C-suite technical influence.',
    minYoe: 20,
    maxYoe: 0,
  },
}

// ---------------------------------------------------------------------------
// COMPANY LEVEL MAPPING SEED DATA
// Format: companySlug → levelCode → UniversalLevel
// Source: Public career frameworks, Glassdoor, Levels.fyi, LinkedIn, official blogs
// ---------------------------------------------------------------------------

// Each entry: { levelCode: string, levelName: string, universalLevel: UniversalLevel }
export interface CompanyLevelSeed {
  levelCode: string
  levelName: string
  universalLevel: UniversalLevel
  roleTrack?: string // If level is track-specific
}

export const COMPANY_LEVEL_MAP: Record<string, CompanyLevelSeed[]> = {
  // ---- GOOGLE ----
  // Source: https://www.levels.fyi/companies/google/salaries/software-engineer
  // Google L3 = New Grad. L7+ is considered "leadership" territory.
  google: [
    { levelCode: 'L3', levelName: 'Software Engineer III', universalLevel: 'L2' },
    { levelCode: 'L4', levelName: 'Software Engineer IV', universalLevel: 'L3' },
    { levelCode: 'L5', levelName: 'Senior Software Engineer', universalLevel: 'L4' },
    { levelCode: 'L6', levelName: 'Staff Software Engineer', universalLevel: 'L5' },
    { levelCode: 'L7', levelName: 'Senior Staff Software Engineer', universalLevel: 'L6' },
    { levelCode: 'L8', levelName: 'Principal Engineer', universalLevel: 'L7' },
    { levelCode: 'L9', levelName: 'Distinguished Engineer', universalLevel: 'L8' },
    { levelCode: 'L10', levelName: 'Google Fellow', universalLevel: 'L9' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- META (Facebook) ----
  // Source: https://www.levels.fyi/companies/meta/salaries/software-engineer
  // Meta E3 = New Grad. E6 is the first real "leadership" level.
  meta: [
    { levelCode: 'E3', levelName: 'Software Engineer', universalLevel: 'L2' },
    { levelCode: 'E4', levelName: 'Software Engineer', universalLevel: 'L3' },
    { levelCode: 'E5', levelName: 'Senior Software Engineer', universalLevel: 'L4' },
    { levelCode: 'E6', levelName: 'Staff Software Engineer', universalLevel: 'L5' },
    { levelCode: 'E7', levelName: 'Senior Staff Software Engineer', universalLevel: 'L6' },
    { levelCode: 'E8', levelName: 'Principal Engineer', universalLevel: 'L7' },
    { levelCode: 'E9', levelName: 'Distinguished Engineer', universalLevel: 'L8' },
    { levelCode: 'E10', levelName: 'Fellow', universalLevel: 'L9' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- MICROSOFT ----
  // Source: https://www.levels.fyi/companies/microsoft/salaries/software-engineer
  // Microsoft uses numeric levels 59-80+. SDE I = L59, SDE II = L62/63, etc.
  microsoft: [
    { levelCode: 'SDE-I', levelName: 'Software Development Engineer I', universalLevel: 'L2' },
    { levelCode: 'SDE-II', levelName: 'Software Development Engineer II', universalLevel: 'L3' },
    { levelCode: 'Senior-SDE', levelName: 'Senior Software Development Engineer', universalLevel: 'L4' },
    { levelCode: 'Principal-SDE-I', levelName: 'Principal Software Development Engineer I', universalLevel: 'L5' },
    { levelCode: 'Principal-SDE-II', levelName: 'Principal Software Development Engineer II', universalLevel: 'L6' },
    { levelCode: 'Distinguished-Eng', levelName: 'Distinguished Engineer', universalLevel: 'L7' },
    { levelCode: 'Technical-Fellow-I', levelName: 'Technical Fellow I', universalLevel: 'L8' },
    { levelCode: 'Technical-Fellow-II', levelName: 'Technical Fellow II', universalLevel: 'L9' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- AMAZON ----
  // Source: https://www.levels.fyi/companies/amazon/salaries/software-engineer
  // Amazon caps base salary at ~$185k USD. Equity is how they differentiate senior levels.
  amazon: [
    { levelCode: 'SDE-I', levelName: 'Software Development Engineer I', universalLevel: 'L2' },
    { levelCode: 'SDE-II', levelName: 'Software Development Engineer II', universalLevel: 'L3' },
    { levelCode: 'SDE-III', levelName: 'Software Development Engineer III (Senior)', universalLevel: 'L4' },
    { levelCode: 'Principal-SDE', levelName: 'Principal Software Development Engineer', universalLevel: 'L5' },
    { levelCode: 'Sr-Principal-SDE', levelName: 'Senior Principal Software Development Engineer', universalLevel: 'L6' },
    { levelCode: 'Distinguished-Eng', levelName: 'Distinguished Engineer', universalLevel: 'L7' },
    { levelCode: 'VP-Eng', levelName: 'Vice President of Engineering', universalLevel: 'L8' },
    { levelCode: 'SVP-Eng', levelName: 'Senior Vice President of Engineering', universalLevel: 'L9' },
    { levelCode: 'Intern', levelName: 'Software Development Engineer Intern', universalLevel: 'L1' },
  ],

  // ---- APPLE ----
  // Source: LinkedIn job postings + Levels.fyi community data
  // Apple uses ICT (Individual Contributor Technology) levels internally.
  apple: [
    { levelCode: 'ICT2', levelName: 'Software Engineer (ICT2)', universalLevel: 'L2' },
    { levelCode: 'ICT3', levelName: 'Software Engineer (ICT3)', universalLevel: 'L3' },
    { levelCode: 'ICT4', levelName: 'Senior Software Engineer (ICT4)', universalLevel: 'L4' },
    { levelCode: 'ICT5', levelName: 'Staff Software Engineer (ICT5)', universalLevel: 'L5' },
    { levelCode: 'ICT6', levelName: 'Senior Staff Engineer (ICT6)', universalLevel: 'L6' },
    { levelCode: 'ICT7', levelName: 'Principal Engineer (ICT7)', universalLevel: 'L7' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- NETFLIX ----
  // Source: Netflix jobs blog + Levels.fyi
  // Netflix is famous for having NO traditional levels publicly — they use
  // "Software Engineer", "Senior Software Engineer", "Staff", "Principal".
  // Internally they calibrate to market bands.
  netflix: [
    { levelCode: 'SE', levelName: 'Software Engineer', universalLevel: 'L3' },
    { levelCode: 'SSE', levelName: 'Senior Software Engineer', universalLevel: 'L4' },
    { levelCode: 'SWE-Staff', levelName: 'Staff Software Engineer', universalLevel: 'L5' },
    { levelCode: 'SWE-Senior-Staff', levelName: 'Senior Staff Software Engineer', universalLevel: 'L6' },
    { levelCode: 'Principal', levelName: 'Principal Software Engineer', universalLevel: 'L7' },
    { levelCode: 'VP-Eng', levelName: 'Vice President of Engineering', universalLevel: 'L8' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- STRIPE ----
  // Source: Levels.fyi community + Stripe engineering blog
  // Stripe uses L1–L8 internally (confusingly similar to our universal system).
  stripe: [
    { levelCode: 'L1', levelName: 'Software Engineer L1', universalLevel: 'L2' },
    { levelCode: 'L2', levelName: 'Software Engineer L2', universalLevel: 'L3' },
    { levelCode: 'L3', levelName: 'Senior Software Engineer L3', universalLevel: 'L4' },
    { levelCode: 'L4', levelName: 'Staff Software Engineer L4', universalLevel: 'L5' },
    { levelCode: 'L5', levelName: 'Senior Staff Engineer L5', universalLevel: 'L6' },
    { levelCode: 'L6', levelName: 'Principal Engineer L6', universalLevel: 'L7' },
    { levelCode: 'L7', levelName: 'Distinguished Engineer L7', universalLevel: 'L8' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- AIRBNB ----
  // Source: Levels.fyi community data
  airbnb: [
    { levelCode: 'L2', levelName: 'Software Engineer L2', universalLevel: 'L2' },
    { levelCode: 'L3', levelName: 'Software Engineer L3', universalLevel: 'L3' },
    { levelCode: 'L4', levelName: 'Software Engineer L4', universalLevel: 'L4' },
    { levelCode: 'L5', levelName: 'Senior Software Engineer L5', universalLevel: 'L4' },
    { levelCode: 'L6', levelName: 'Staff Software Engineer L6', universalLevel: 'L5' },
    { levelCode: 'L7', levelName: 'Principal Software Engineer L7', universalLevel: 'L6' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- UBER ----
  // Source: Levels.fyi community data
  uber: [
    { levelCode: 'L3', levelName: 'Software Engineer II', universalLevel: 'L2' },
    { levelCode: 'L4', levelName: 'Software Engineer III', universalLevel: 'L3' },
    { levelCode: 'L5a', levelName: 'Senior Software Engineer I', universalLevel: 'L4' },
    { levelCode: 'L5b', levelName: 'Senior Software Engineer II', universalLevel: 'L4' },
    { levelCode: 'L6', levelName: 'Staff Software Engineer', universalLevel: 'L5' },
    { levelCode: 'L7', levelName: 'Senior Staff Software Engineer', universalLevel: 'L6' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- FLIPKART (Indian market) ----
  // Source: LinkedIn profiles + 6figr data + Glassdoor India
  flipkart: [
    { levelCode: 'SDE-1', levelName: 'Software Development Engineer 1', universalLevel: 'L2' },
    { levelCode: 'SDE-2', levelName: 'Software Development Engineer 2', universalLevel: 'L3' },
    { levelCode: 'SDE-3', levelName: 'Software Development Engineer 3', universalLevel: 'L4' },
    { levelCode: 'Principal-SDE', levelName: 'Principal Software Development Engineer', universalLevel: 'L5' },
    { levelCode: 'Senior-Principal', levelName: 'Senior Principal Engineer', universalLevel: 'L6' },
    { levelCode: 'Distinguished', levelName: 'Distinguished Engineer', universalLevel: 'L7' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- INFOSYS (Indian IT major) ----
  // Source: Infosys career framework + AmbitionBox + 6figr
  // Infosys uses "Band" system: Band B (entry) → Band E (VP-equivalent)
  infosys: [
    { levelCode: 'Band-A', levelName: 'Systems Engineer Trainee (Band A)', universalLevel: 'L1' },
    { levelCode: 'Band-B', levelName: 'Systems Engineer (Band B)', universalLevel: 'L2' },
    { levelCode: 'Band-C', levelName: 'Senior Systems Engineer (Band C)', universalLevel: 'L3' },
    { levelCode: 'Band-C-Technical', levelName: 'Technology Analyst / Specialist (Band C+)', universalLevel: 'L4' },
    { levelCode: 'Band-D', levelName: 'Technical Lead / Senior Technology Lead (Band D)', universalLevel: 'L5' },
    { levelCode: 'Band-D-Mgr', levelName: 'Delivery Manager / Principal Architect (Band D+)', universalLevel: 'L6' },
    { levelCode: 'Band-E', levelName: 'Associate Vice President (Band E)', universalLevel: 'L7' },
    { levelCode: 'Band-VP', levelName: 'Vice President (Band VP)', universalLevel: 'L8' },
  ],

  // ---- TCS (Tata Consultancy Services) ----
  // Source: TCS career ladder + Glassdoor India + AmbitionBox
  // TCS uses numeric grades: C1 (entry) → above grade F (VP)
  tcs: [
    { levelCode: 'Grade-C', levelName: 'Assistant Systems Engineer (Grade C)', universalLevel: 'L1' },
    { levelCode: 'Grade-D', levelName: 'Systems Engineer (Grade D)', universalLevel: 'L2' },
    { levelCode: 'Grade-E', levelName: 'IT Analyst (Grade E)', universalLevel: 'L3' },
    { levelCode: 'Grade-F', levelName: 'Assistant Consultant (Grade F)', universalLevel: 'L4' },
    { levelCode: 'Grade-G', levelName: 'Consultant (Grade G)', universalLevel: 'L5' },
    { levelCode: 'Grade-H', levelName: 'Lead Consultant (Grade H)', universalLevel: 'L6' },
    { levelCode: 'Senior-Mgr', levelName: 'Senior Manager / Principal Consultant', universalLevel: 'L7' },
    { levelCode: 'AVP', levelName: 'Assistant Vice President', universalLevel: 'L8' },
  ],

  // ---- WIPRO ----
  // Source: Wipro career framework + LinkedIn profiles
  wipro: [
    { levelCode: 'Trainee', levelName: 'Project Engineer Trainee', universalLevel: 'L1' },
    { levelCode: 'PE', levelName: 'Project Engineer', universalLevel: 'L2' },
    { levelCode: 'SE', levelName: 'Software Engineer', universalLevel: 'L2' },
    { levelCode: 'Sr-SE', levelName: 'Senior Software Engineer', universalLevel: 'L3' },
    { levelCode: 'Tech-Lead', levelName: 'Technology Lead', universalLevel: 'L4' },
    { levelCode: 'Tech-Architect', levelName: 'Technology Architect', universalLevel: 'L5' },
    { levelCode: 'Principal-Architect', levelName: 'Principal Architect', universalLevel: 'L6' },
    { levelCode: 'GM', levelName: 'General Manager', universalLevel: 'L7' },
  ],

  // ---- ZOMATO (Indian Product) ----
  // Source: LinkedIn profiles + levels.fyi India community
  zomato: [
    { levelCode: 'SWE-1', levelName: 'Software Engineer 1', universalLevel: 'L2' },
    { levelCode: 'SWE-2', levelName: 'Software Engineer 2', universalLevel: 'L3' },
    { levelCode: 'SWE-3', levelName: 'Senior Software Engineer', universalLevel: 'L4' },
    { levelCode: 'Staff-SWE', levelName: 'Staff Software Engineer', universalLevel: 'L5' },
    { levelCode: 'Principal-SWE', levelName: 'Principal Engineer', universalLevel: 'L6' },
    { levelCode: 'VP-Eng', levelName: 'VP Engineering', universalLevel: 'L8' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],

  // ---- SWIGGY (Indian Product) ----
  swiggy: [
    { levelCode: 'SDE-1', levelName: 'Software Development Engineer 1', universalLevel: 'L2' },
    { levelCode: 'SDE-2', levelName: 'Software Development Engineer 2', universalLevel: 'L3' },
    { levelCode: 'SDE-3', levelName: 'Senior Software Development Engineer', universalLevel: 'L4' },
    { levelCode: 'Lead-SDE', levelName: 'Lead Software Development Engineer', universalLevel: 'L5' },
    { levelCode: 'Principal-SDE', levelName: 'Principal Software Development Engineer', universalLevel: 'L6' },
    { levelCode: 'Intern', levelName: 'Software Engineering Intern', universalLevel: 'L1' },
  ],
}

// ---------------------------------------------------------------------------
// LEVEL NORMALIZER CLASS
// ---------------------------------------------------------------------------

export interface CompanyLevelRef {
  companySlug: string
  levelCode: string
}

export interface LevelComparison {
  levelsApart: number           // Positive = b is more senior, negative = a is more senior
  isMismatched: boolean         // True if |levelsApart| > 1
  warning: string | null        // Human-readable warning for UI
  aUniversal: UniversalLevel
  bUniversal: UniversalLevel
}

export interface CompanyLevelEquivalent {
  companySlug: string
  levelCode: string
  levelName: string
  isExact: boolean    // True if this is a 1:1 mapping, false if approximate
}

export class LevelNormalizer {
  /**
   * Normalize a company-specific level to the universal L1–L9 system.
   * Returns null if the mapping is not found.
   */
  normalizeToUniversal(
    companySlug: string,
    levelCode: string
  ): UniversalLevel | null {
    const companyLevels = COMPANY_LEVEL_MAP[companySlug.toLowerCase()]
    if (!companyLevels) return null

    const match = companyLevels.find(
      (l) => l.levelCode.toLowerCase() === levelCode.toLowerCase()
    )
    return match?.universalLevel ?? null
  }

  /**
   * Get all known company-specific equivalents for a universal level.
   * Useful for "also known as" display in the UI.
   */
  getEquivalents(universalLevel: UniversalLevel): CompanyLevelEquivalent[] {
    const result: CompanyLevelEquivalent[] = []

    for (const [slug, levels] of Object.entries(COMPANY_LEVEL_MAP)) {
      for (const level of levels) {
        if (level.universalLevel === universalLevel) {
          result.push({
            companySlug: slug,
            levelCode: level.levelCode,
            levelName: level.levelName,
            isExact: true,
          })
        }
      }
    }

    return result
  }

  /**
   * Compare two company levels and detect mismatches.
   * This is critical for the comparison tool — comparing L4 vs L6 comp
   * without a warning is misleading.
   */
  compareLevels(
    a: CompanyLevelRef,
    b: CompanyLevelRef
  ): LevelComparison {
    const aUniversal = this.normalizeToUniversal(a.companySlug, a.levelCode)
    const bUniversal = this.normalizeToUniversal(b.companySlug, b.levelCode)

    // Fallback: if we can't normalize, treat as same level
    const aOrder = aUniversal ? UNIVERSAL_LEVELS[aUniversal].order : 4
    const bOrder = bUniversal ? UNIVERSAL_LEVELS[bUniversal].order : 4

    const levelsApart = bOrder - aOrder
    const isMismatched = Math.abs(levelsApart) > 1

    let warning: string | null = null
    if (isMismatched) {
      const aLabel = aUniversal
        ? `${UNIVERSAL_LEVELS[aUniversal].title} (${aUniversal})`
        : 'Unknown Level'
      const bLabel = bUniversal
        ? `${UNIVERSAL_LEVELS[bUniversal].title} (${bUniversal})`
        : 'Unknown Level'

      warning = `Level mismatch: comparing ${a.companySlug} ${a.levelCode} (≈${aLabel}) with ${b.companySlug} ${b.levelCode} (≈${bLabel}). These are ${Math.abs(levelsApart)} level(s) apart — compensation comparison may be misleading.`
    }

    return {
      levelsApart,
      isMismatched,
      warning,
      aUniversal: aUniversal ?? 'L4',
      bUniversal: bUniversal ?? 'L4',
    }
  }

  /**
   * Get all levels for a company, sorted by order (junior → senior)
   */
  getCompanyLadder(companySlug: string): CompanyLevelSeed[] {
    const levels = COMPANY_LEVEL_MAP[companySlug.toLowerCase()] ?? []
    // Sort by the universal level order
    return levels.sort(
      (a, b) =>
        UNIVERSAL_LEVELS[a.universalLevel].order -
        UNIVERSAL_LEVELS[b.universalLevel].order
    )
  }
}

// Singleton export for use across the application
export const levelNormalizer = new LevelNormalizer()
