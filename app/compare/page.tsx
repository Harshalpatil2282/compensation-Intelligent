// app/compare/page.tsx
// Side-by-side offer comparison tool

import type { Metadata } from 'next'
import { ComparePageClient } from '@/features/compensation/ui/ComparePageClient'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Compare Offers',
  description:
    'Compare up to 4 compensation offers side-by-side with level normalization and equity breakdown.',
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar activePath="/compare" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Offer Comparison Tool</h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare up to 4 offers side-by-side. Level mismatches are flagged automatically.
          </p>
        </div>
        <ComparePageClient />
      </main>
    </div>
  )
}
