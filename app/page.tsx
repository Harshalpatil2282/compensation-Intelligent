// app/page.tsx
// Landing page — marketing hero, value props, live data preview
// Server Component: fetches aggregate stats at render time

import Link from 'next/link'
import { ArrowRight, BarChart2, Shield, TrendingUp, Globe, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'

// Sample data for the landing page preview (real data would come from the DB)
const SAMPLE_DATA = [
  {
    company: 'Google', level: 'L5', role: 'Backend Engineering',
    location: 'Bangalore', base: '$180K', equity: '$60K/yr', total: '$250K',
    yoe: 7, universal: 'L4 · Senior',
  },
  {
    company: 'Flipkart', level: 'SDE-3', role: 'Platform Engineering',
    location: 'Bangalore', base: '₹45L', equity: '₹25L/yr', total: '₹78L',
    yoe: 6, universal: 'L4 · Senior',
  },
  {
    company: 'Meta', level: 'E5', role: 'Frontend Engineering',
    location: 'Remote', base: '$210K', equity: '$80K/yr', total: '$320K',
    yoe: 8, universal: 'L4 · Senior',
  },
  {
    company: 'Stripe', level: 'L3', role: 'Full Stack',
    location: 'Singapore', base: '$160K', equity: '$55K/yr', total: '$230K',
    yoe: 5, universal: 'L4 · Senior',
  },
  {
    company: 'Zomato', level: 'SWE-3', role: 'Mobile Engineering',
    location: 'Gurgaon', base: '₹40L', equity: '₹18L/yr', total: '₹65L',
    yoe: 5, universal: 'L4 · Senior',
  },
]

const FEATURES = [
  {
    icon: Layers,
    title: 'Level Normalization',
    description:
      'Google L5 = Meta E5 = Amazon SDE-III. We map 15+ company ladders to a universal L1–L9 scale so you compare apples to apples.',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: BarChart2,
    title: 'Percentile Bands',
    description:
      'See exactly where your offer lands — p25, p50, p75, p90. Filter by role, level, company, location, and years of experience.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: TrendingUp,
    title: 'Full TC Breakdown',
    description:
      'Base + bonus + equity (annualized). Equity type, vesting schedule, cliff. No more "total comp" that hides the equity math.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Globe,
    title: 'India + Global',
    description:
      'INR and USD. Indian IT bands (Infosys Band C, TCS Grade F) alongside FAANG levels. Tier 1/2/3 city normalization.',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Shield,
    title: 'Anonymous by Default',
    description:
      'Submit without linking to your profile. We never expose PII without explicit consent. Verify optionally for trust badge.',
    gradient: 'from-sky-500/20 to-blue-500/20',
    iconColor: 'text-sky-400',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">

      {/* Navigation */}
      <Navbar activePath="/" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="gradient" size="lg" className="mb-6 animate-fade-in">
            <TrendingUp className="h-3 w-3" />
            Levels Matter More Than Titles
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
            Know Your{' '}
            <span className="gradient-text">True Market Value</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
            Level-normalized compensation data for tech professionals in India and globally.
            Compare offers, understand percentile bands, and negotiate with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Link href="/explore">
              <Button variant="gradient" size="lg" className="gap-2 group">
                Explore Compensation Data
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/submit">
              <Button variant="secondary" size="lg">
                Submit Anonymously
              </Button>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-10 border-t border-white/5 animate-fade-in-up stagger-3">
            {[
              { label: 'Salary Records', value: '12,400+' },
              { label: 'Companies', value: '340+' },
              { label: 'Median TC (Bangalore L4)', value: '₹45L' },
              { label: 'Level Mappings', value: '15 companies' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Data Preview Table */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Live Compensation Data</h2>
            <p className="text-sm text-slate-400 mt-1">All normalized to universal levels. All verified by our team.</p>
          </div>
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-white/5">
                <th>Company</th>
                <th>Role</th>
                <th>Level</th>
                <th>Location</th>
                <th>Base</th>
                <th>Equity/yr</th>
                <th>Total TC</th>
                <th>YOE</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="font-medium text-white">{row.company}</td>
                  <td className="text-slate-400 text-xs">{row.role}</td>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="level" size="sm">{row.level}</Badge>
                      <span className="text-xs text-slate-500">{row.universal}</span>
                    </div>
                  </td>
                  <td className="text-slate-400">{row.location}</td>
                  <td className="font-mono text-sm text-slate-200">{row.base}</td>
                  <td className="font-mono text-sm text-emerald-400">{row.equity}</td>
                  <td className="font-mono text-sm font-bold text-white">{row.total}</td>
                  <td className="text-slate-400">{row.yoe}y</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Built Different
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every other platform treats &quot;Senior Software Engineer&quot; as one data point.
            We know it could be L4 or L7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <Card
              key={feature.title}
              className={`relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 pointer-events-none`}
              />
              <div className="relative p-6">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 mb-4 ${feature.iconColor}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">
              Your data makes this better for everyone
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Anonymous submissions. No PII required. Just share your comp data and help
              thousands of engineers negotiate better offers.
            </p>
            <Link href="/submit">
              <Button variant="gradient" size="lg">
                Submit Your Compensation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2024 CompIntel. Data is self-reported and for informational purposes only.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'About', 'API (v3)'].map((link) => (
              <a key={link} href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
