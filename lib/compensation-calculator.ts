// lib/compensation-calculator.ts
// Compensation calculation utilities:
// - Currency normalization to USD (static rates v1)
// - Equity annualization
// - Total comp calculation
// - Percentile ranking

import { Decimal } from '@prisma/client/runtime/library'

// ---------------------------------------------------------------------------
// STATIC EXCHANGE RATES (v1)
// Updated: 2024-01. These are approximate annual average rates.
// v2 TODO: Replace with live Fixer.io / Open Exchange Rates API call.
// Rate = how many local currency units = 1 USD
// ---------------------------------------------------------------------------

const STATIC_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  INR: 83.5,     // Indian Rupee (2024 average)
  EUR: 0.92,     // Euro
  GBP: 0.79,     // British Pound
  SGD: 1.34,     // Singapore Dollar
  AUD: 1.53,     // Australian Dollar
  CAD: 1.36,     // Canadian Dollar
  JPY: 148.0,    // Japanese Yen
  HKD: 7.82,     // Hong Kong Dollar
  CHF: 0.88,     // Swiss Franc
  AED: 3.67,     // UAE Dirham
  MYR: 4.68,     // Malaysian Ringgit
  PHP: 56.5,     // Philippine Peso
  THB: 35.2,     // Thai Baht
  IDR: 15800,    // Indonesian Rupiah
  BRL: 4.97,     // Brazilian Real
  MXN: 17.1,     // Mexican Peso
  PLN: 3.97,     // Polish Zloty
  CZK: 23.0,     // Czech Koruna
}

export interface TotalComp {
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

export interface PercentileResult {
  p25: number
  p50: number
  p75: number
  p90: number
  count: number
}

// ---------------------------------------------------------------------------
// CURRENCY NORMALIZATION
// ---------------------------------------------------------------------------

/**
 * Convert an amount in local currency to USD using static rates.
 * @param amount - Amount in local currency
 * @param currency - ISO 4217 currency code (e.g., 'INR', 'USD')
 * @param _date - Reserved for v2 live rates (currently unused)
 * @returns Amount in USD, rounded to 2 decimal places
 */
export function normalizeToUSD(
  amount: number | Decimal,
  currency: string,
  _date?: Date
): number {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  const rate = STATIC_RATES_TO_USD[currency.toUpperCase()]

  if (!rate) {
    // Unknown currency: return as-is with a console warning
    // In production, this should be logged to Sentry
    console.warn(`[compensation-calculator] Unknown currency: ${currency}. Treating as USD.`)
    return Math.round(numericAmount * 100) / 100
  }

  // Divide by rate because rates are "local units per 1 USD"
  const usdAmount = numericAmount / rate
  return Math.round(usdAmount * 100) / 100
}

/**
 * Get the exchange rate for a currency (local units per 1 USD)
 */
export function getExchangeRate(currency: string): number {
  return STATIC_RATES_TO_USD[currency.toUpperCase()] ?? 1
}

/**
 * Get all supported currencies with their rates
 */
export function getSupportedCurrencies(): Array<{ code: string; rate: number }> {
  return Object.entries(STATIC_RATES_TO_USD).map(([code, rate]) => ({ code, rate }))
}

// ---------------------------------------------------------------------------
// EQUITY CALCULATION
// ---------------------------------------------------------------------------

/**
 * Calculate the annualized equity value.
 * Standard: 4-year vesting with 1-year cliff.
 * We distribute the cliff vest evenly for annualization purposes.
 *
 * @param totalUsd - Total equity grant in USD
 * @param vestingYears - Total vesting period (default: 4)
 * @param _cliffMonths - Cliff period in months (default: 12, affects vesting schedule display only)
 * @returns Annual equity value in USD
 */
export function calculateAnnualizedEquity(
  totalUsd: number | Decimal | null,
  vestingYears: number = 4,
  _cliffMonths: number = 12
): number {
  if (!totalUsd) return 0
  const total = typeof totalUsd === 'number' ? totalUsd : Number(totalUsd)
  if (vestingYears <= 0) return 0
  // Simple linear annualization: total / years
  // Note: Real RSU grants may have different annual amounts due to refresh grants.
  // We normalize to straight-line for comparability.
  return Math.round((total / vestingYears) * 100) / 100
}

// ---------------------------------------------------------------------------
// TOTAL COMP CALCULATION
// ---------------------------------------------------------------------------

/**
 * Calculate total compensation from components.
 * All inputs should be in USD.
 *
 * @param baseSalaryUsd - Annual base salary in USD
 * @param annualBonusUsd - Annual bonus (actual payout, not target %) in USD
 * @param equityTotalUsd - Total equity grant in USD
 * @param equityVestingYears - Vesting period for equity annualization
 */
export function calculateTotalComp(
  baseSalaryUsd: number,
  annualBonusUsd: number = 0,
  equityTotalUsd: number | null = null,
  equityVestingYears: number = 4
): TotalComp {
  const base = baseSalaryUsd
  const bonus = annualBonusUsd
  const equity = calculateAnnualizedEquity(equityTotalUsd, equityVestingYears)
  const total = base + bonus + equity

  const breakdown = {
    basePercent: total > 0 ? Math.round((base / total) * 100) : 0,
    bonusPercent: total > 0 ? Math.round((bonus / total) * 100) : 0,
    equityPercent: total > 0 ? Math.round((equity / total) * 100) : 0,
  }

  return {
    baseSalaryUsd: Math.round(base * 100) / 100,
    annualBonusUsd: Math.round(bonus * 100) / 100,
    annualEquityUsd: equity,
    totalCompUsd: Math.round(total * 100) / 100,
    breakdown,
  }
}

// ---------------------------------------------------------------------------
// PERCENTILE RANKING
// ---------------------------------------------------------------------------

/**
 * Get the percentile rank of a value within a distribution.
 * Returns 0-100.
 *
 * @param value - The value to rank
 * @param distribution - Array of all values in the distribution
 */
export function getPercentileRank(
  value: number,
  distribution: number[]
): number {
  if (distribution.length === 0) return 50 // Default to median if no data
  const sorted = [...distribution].sort((a, b) => a - b)
  const below = sorted.filter((v) => v < value).length
  return Math.round((below / sorted.length) * 100)
}

/**
 * Calculate percentile values (p25, p50, p75, p90) from an array of numbers.
 * Uses linear interpolation between array elements.
 */
export function calculatePercentiles(values: number[]): PercentileResult {
  if (values.length === 0) {
    return { p25: 0, p50: 0, p75: 0, p90: 0, count: 0 }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const count = sorted.length

  function percentile(p: number): number {
    const index = (p / 100) * (count - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sorted[lower]
    const fraction = index - lower
    return sorted[lower] * (1 - fraction) + sorted[upper] * fraction
  }

  return {
    p25: Math.round(percentile(25)),
    p50: Math.round(percentile(50)),
    p75: Math.round(percentile(75)),
    p90: Math.round(percentile(90)),
    count,
  }
}
