// features/compensation/ui/ComparePageClient.tsx
// Client-side comparison tool — select up to 4 offers or enter ad-hoc data

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD } from '@/lib/utils'
import { UNIVERSAL_LEVELS, type UniversalLevel } from '@/lib/level-normalization'
import { Plus, Trash2, AlertTriangle, Trophy } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

interface AdHocOffer {
  label: string
  companySlug: string
  levelCode: string
  baseSalaryUsd: string
  annualBonusUsd: string
  equityTotalUsd: string
  equityVestingYears: string
}

interface OfferResult {
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
  breakdown: { basePercent: number; bonusPercent: number; equityPercent: number }
}

interface ComparisonResult {
  offers: OfferResult[]
  winner: { base: string; equity: string; total: string }
  levelWarnings: string[]
  deltas: Array<{ pair: [string, string]; totalDeltaUsd: number; totalDeltaPct: number }>
}

const EMPTY_OFFER: AdHocOffer = {
  label: '',
  companySlug: '',
  levelCode: '',
  baseSalaryUsd: '',
  annualBonusUsd: '',
  equityTotalUsd: '',
  equityVestingYears: '4',
}

async function compareOffers(offers: AdHocOffer[]): Promise<ComparisonResult> {
  const res = await fetch('/api/v1/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offers: offers
        .filter((o) => o.label && o.baseSalaryUsd)
        .map((o) => ({
          label: o.label,
          companySlug: o.companySlug || 'unknown',
          levelCode: o.levelCode || 'L4',
          baseSalaryUsd: Number(o.baseSalaryUsd),
          annualBonusUsd: o.annualBonusUsd ? Number(o.annualBonusUsd) : undefined,
          equityTotalUsd: o.equityTotalUsd ? Number(o.equityTotalUsd) : undefined,
          equityVestingYears: o.equityVestingYears ? Number(o.equityVestingYears) : 4,
        })),
    }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error?.message ?? 'Comparison failed')
  return body.data
}

export function ComparePageClient() {
  const [offers, setOffers] = useState<AdHocOffer[]>([
    { ...EMPTY_OFFER, label: 'Offer A' },
    { ...EMPTY_OFFER, label: 'Offer B' },
  ])

  const mutation = useMutation({ mutationFn: compareOffers })

  const addOffer = () => {
    if (offers.length < 4) {
      setOffers((prev) => [
        ...prev,
        { ...EMPTY_OFFER, label: `Offer ${String.fromCharCode(65 + prev.length)}` },
      ])
    }
  }

  const removeOffer = (i: number) => {
    setOffers((prev) => prev.filter((_, idx) => idx !== i))
  }

  const updateOffer = (i: number, key: keyof AdHocOffer, value: string) => {
    setOffers((prev) => prev.map((o, idx) => idx === i ? { ...o, [key]: value } : o))
  }

  const result = mutation.data

  return (
    <div className="space-y-8">
      {/* Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {offers.map((offer, i) => (
          <Card key={i} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Input
                  value={offer.label}
                  onChange={(e) => updateOffer(i, 'label', e.target.value)}
                  className="font-semibold text-sm h-8 bg-transparent border-0 px-0 focus:ring-0 text-white"
                  id={`offer-label-${i}`}
                />
                {offers.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOffer(i)}
                    className="h-7 w-7 text-slate-500 hover:text-red-400"
                    aria-label={`Remove ${offer.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Company slug (e.g., google)"
                value={offer.companySlug}
                onChange={(e) => updateOffer(i, 'companySlug', e.target.value)}
                id={`offer-company-${i}`}
              />
              <Input
                placeholder="Level (e.g., L5, E5, SDE-III)"
                value={offer.levelCode}
                onChange={(e) => updateOffer(i, 'levelCode', e.target.value)}
                id={`offer-level-${i}`}
              />
              <Input
                label="Base Salary (USD)"
                type="number"
                placeholder="e.g., 180000"
                value={offer.baseSalaryUsd}
                onChange={(e) => updateOffer(i, 'baseSalaryUsd', e.target.value)}
                id={`offer-base-${i}`}
              />
              <Input
                label="Annual Bonus (USD)"
                type="number"
                placeholder="e.g., 30000"
                value={offer.annualBonusUsd}
                onChange={(e) => updateOffer(i, 'annualBonusUsd', e.target.value)}
                id={`offer-bonus-${i}`}
              />
              <Input
                label="Total Equity (USD, full grant)"
                type="number"
                placeholder="e.g., 400000"
                value={offer.equityTotalUsd}
                onChange={(e) => updateOffer(i, 'equityTotalUsd', e.target.value)}
                id={`offer-equity-${i}`}
              />
            </CardContent>
          </Card>
        ))}

        {offers.length < 4 && (
          <button
            onClick={addOffer}
            className="h-full min-h-[320px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all group"
            aria-label="Add another offer"
          >
            <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Add Offer</span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          variant="gradient"
          size="lg"
          onClick={() => mutation.mutate(offers)}
          isLoading={mutation.isPending}
          className="min-w-[200px]"
        >
          Compare Offers
        </Button>
      </div>

      {/* Level Warnings */}
      {result?.levelWarnings.map((warning, i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">{warning}</p>
        </div>
      ))}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Comparison Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-6">
                        Component
                      </th>
                      {result.offers.map((offer) => (
                        <th key={offer.label} className="text-left text-xs font-semibold text-slate-300 pb-3 pr-6">
                          <div>{offer.label}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="level" size="sm">{offer.universalLevel}</Badge>
                            <span className="text-slate-500 font-normal text-xs">{offer.levelCode}</span>
                          </div>
                          {result.winner.total === offer.label && (
                            <Badge variant="success" size="sm" className="mt-1">
                              <Trophy className="h-2.5 w-2.5" /> Best Total
                            </Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {[
                      { label: 'Base Salary', key: 'baseSalaryUsd' as const, winner: result.winner.base },
                      { label: 'Annual Bonus', key: 'annualBonusUsd' as const, winner: null },
                      { label: 'Annual Equity', key: 'annualEquityUsd' as const, winner: result.winner.equity },
                      { label: 'Total TC', key: 'totalCompUsd' as const, winner: result.winner.total },
                    ].map(({ label, key, winner }) => (
                      <tr key={label} className="border-t border-white/5">
                        <td className="py-3 pr-6 text-sm text-slate-400">{label}</td>
                        {result.offers.map((offer) => {
                          const value = offer[key]
                          const isWinner = winner === offer.label
                          return (
                            <td key={offer.label} className="py-3 pr-6">
                              <span className={`font-mono text-sm font-bold ${
                                label === 'Total TC' ? 'text-white text-base' :
                                isWinner ? 'text-emerald-400' : 'text-slate-300'
                              }`}>
                                {value > 0 ? formatUSD(value) : '—'}
                              </span>
                              {isWinner && label !== 'Total TC' && (
                                <Badge variant="success" size="sm" className="ml-2">Best</Badge>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}

                    {/* Breakdown bars */}
                    <tr className="border-t border-white/5">
                      <td className="py-3 pr-6 text-sm text-slate-400">Breakdown</td>
                      {result.offers.map((offer) => (
                        <td key={offer.label} className="py-3 pr-6">
                          <div className="h-4 flex rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600"
                              style={{ width: `${offer.breakdown.basePercent}%` }}
                              title={`Base: ${offer.breakdown.basePercent}%`}
                            />
                            <div
                              className="bg-purple-600"
                              style={{ width: `${offer.breakdown.bonusPercent}%` }}
                              title={`Bonus: ${offer.breakdown.bonusPercent}%`}
                            />
                            <div
                              className="bg-emerald-600"
                              style={{ width: `${offer.breakdown.equityPercent}%` }}
                              title={`Equity: ${offer.breakdown.equityPercent}%`}
                            />
                          </div>
                          <div className="flex gap-2 mt-1 text-xs text-slate-500">
                            <span>Base {offer.breakdown.basePercent}%</span>
                            <span>Eq {offer.breakdown.equityPercent}%</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pairwise Deltas */}
          {result.deltas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Total TC Differences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.deltas.map((delta, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {delta.pair[0]} vs {delta.pair[1]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${delta.totalDeltaUsd > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {delta.totalDeltaUsd > 0 ? '+' : ''}{formatUSD(delta.totalDeltaUsd)}
                        </span>
                        <Badge variant={delta.totalDeltaUsd > 0 ? 'success' : 'danger'} size="sm">
                          {delta.totalDeltaPct > 0 ? '+' : ''}{delta.totalDeltaPct}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
