// app/explore/page.tsx
// Main compensation explorer — filter sidebar + paginated results table
// Server Component with search params for URL-synced filters

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ExploreClient } from '@/features/compensation/ui/ExploreClient'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Explore Compensation Data',
  description:
    'Search and filter compensation data by company, role, level, location, and experience. See p25/p50/p75/p90 percentile bands.',
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <Navbar activePath="/explore" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Compensation Explorer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse verified salary data. All levels normalized to universal L1–L9 scale.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex gap-6">
            <div className="w-64 shrink-0 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-slate-800 animate-shimmer" />
              ))}
            </div>
            <div className="flex-1 space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-slate-800 animate-shimmer" />
              ))}
            </div>
          </div>
        }>
          <ExploreClient />
        </Suspense>
      </main>
    </div>
  )
}
