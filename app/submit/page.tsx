// app/submit/page.tsx
// Multi-step compensation submission form
// 5 steps: Company+Role → Level → Compensation → Context → Review+Submit

import type { Metadata } from 'next'
import { SubmitForm } from '@/features/compensation/ui/SubmitForm'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Submit Your Compensation',
  description:
    'Anonymously submit your salary, bonus, and equity data. Help others know their market value.',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar activePath="/submit" />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Submit Your Compensation</h1>
          <p className="text-slate-400 text-sm mt-2">
            Takes 3 minutes. Anonymous by default. Your data helps thousands of engineers
            negotiate better offers.
          </p>
        </div>
        <SubmitForm />
      </main>
    </div>
  )
}
