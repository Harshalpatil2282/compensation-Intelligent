// app/company/[slug]/page.tsx
// Company profile: level ladder + compensation by level + trend

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UNIVERSAL_LEVELS } from '@/lib/level-normalization'
import { formatUSD } from '@/lib/utils'

interface CompanyPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  })
  if (!company) return { title: 'Company Not Found' }
  return {
    title: `${company.name} Compensation`,
    description: `Level ladder, compensation by level, and total comp percentiles for ${company.name}.`,
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      levels: {
        orderBy: { levelOrder: 'asc' },
      },
    },
  })

  if (!company) notFound()

  // Fetch median TC per level
  const compensationByLevel = await prisma.compensation.groupBy({
    by: ['universalLevel'],
    where: { companyId: company.id, status: 'APPROVED' },
    _avg: { totalCompUsd: true, baseSalaryUsd: true, equityAnnualUsd: true },
    _count: { id: true },
  })

  const levelDataMap = new Map(
    compensationByLevel.map((d) => [
      d.universalLevel,
      {
        avgTotal: Math.round(Number(d._avg.totalCompUsd) ?? 0),
        avgBase: Math.round(Number(d._avg.baseSalaryUsd) ?? 0),
        avgEquity: Math.round(Number(d._avg.equityAnnualUsd) ?? 0),
        count: d._count.id,
      },
    ])
  )

  const maxTotal = Math.max(
    ...Array.from(levelDataMap.values()).map((d) => d.avgTotal),
    1
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CI</span>
            </div>
            <span className="font-bold text-white">CompIntel</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">{company.name}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Company Header */}
        <div className="flex items-start gap-6">
          <div className="h-16 w-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-white/10">
            {company.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="default">{company.industry ?? 'Technology'}</Badge>
              <Badge variant="default">{company.sizeBand.replace(/_/g, ' ')}</Badge>
              <Badge variant="default">{company.hqCountry}</Badge>
              {company.isVerified && <Badge variant="success">✓ Verified</Badge>}
            </div>
            {company.description && (
              <p className="text-slate-400 mt-3 max-w-2xl text-sm">{company.description}</p>
            )}
          </div>
        </div>

        {/* Level Ladder */}
        <Card>
          <CardHeader>
            <CardTitle>Level Ladder & Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            {company.levels.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No level data available yet. <a href="/submit" className="text-indigo-400 hover:underline">Submit yours</a>.
              </p>
            ) : (
              <div className="space-y-3">
                {company.levels.map((level) => {
                  const data = levelDataMap.get(level.universalLevel)
                  const barWidth = data ? (data.avgTotal / maxTotal) * 100 : 0
                  const uInfo = UNIVERSAL_LEVELS[level.universalLevel]

                  return (
                    <div key={level.id} className="grid grid-cols-[120px_100px_1fr_140px] gap-4 items-center">
                      {/* Company level code */}
                      <div>
                        <span className="font-mono text-sm font-bold text-indigo-400">
                          {level.levelCode}
                        </span>
                        <p className="text-xs text-slate-500 truncate">{level.levelName}</p>
                      </div>

                      {/* Universal level */}
                      <div>
                        <Badge variant="level" size="sm">{level.universalLevel}</Badge>
                        <p className="text-xs text-slate-500 mt-0.5">{uInfo?.title}</p>
                      </div>

                      {/* Bar chart */}
                      <div className="h-8 flex items-center">
                        {data ? (
                          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full pct-bar-fill rounded-full transition-all duration-700"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        ) : (
                          <div className="w-full bg-slate-800/50 rounded-full h-4 flex items-center justify-center">
                            <span className="text-xs text-slate-600">No data yet</span>
                          </div>
                        )}
                      </div>

                      {/* Numbers */}
                      <div className="text-right">
                        {data ? (
                          <>
                            <div className="text-sm font-bold text-white">{formatUSD(data.avgTotal)}</div>
                            <div className="text-xs text-slate-500">{data.count} reports</div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-600">&mdash;</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        {compensationByLevel.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Reports',
                value: compensationByLevel.reduce((sum, d) => sum + d._count.id, 0),
                format: (v: number) => v.toLocaleString(),
              },
              {
                label: 'Avg Total TC',
                value:
                  compensationByLevel.reduce((sum, d) => sum + Number(d._avg.totalCompUsd ?? 0), 0) /
                  compensationByLevel.length,
                format: formatUSD,
              },
              {
                label: 'Avg Base',
                value:
                  compensationByLevel.reduce((sum, d) => sum + Number(d._avg.baseSalaryUsd ?? 0), 0) /
                  compensationByLevel.length,
                format: formatUSD,
              },
              {
                label: 'Levels Tracked',
                value: company.levels.length,
                format: (v: number) => `${v} levels`,
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="py-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.format(stat.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
