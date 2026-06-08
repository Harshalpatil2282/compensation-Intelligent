// features/compensation/ui/SubmitForm.tsx
// Multi-step compensation submission form
// Steps: Company+Role → Level → Compensation → Context → Review+Submit

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useSubmitCompensation } from '../hooks/useSubmitCompensation'
import { useCompanySearch } from '@/features/companies/hooks/useCompanySearch'
import { formatUSD } from '@/lib/utils'
import { CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'

const TOTAL_STEPS = 5

const STEP_LABELS = [
  'Company & Role',
  'Level',
  'Compensation',
  'Context',
  'Review & Submit',
]

const UNIVERSAL_LEVELS = [
  { value: 'L1', label: 'L1 — Intern' },
  { value: 'L2', label: 'L2 — Junior / Entry' },
  { value: 'L3', label: 'L3 — Mid-Level' },
  { value: 'L4', label: 'L4 — Senior' },
  { value: 'L5', label: 'L5 — Staff / Lead' },
  { value: 'L6', label: 'L6 — Senior Staff' },
  { value: 'L7', label: 'L7 — Principal' },
  { value: 'L8', label: 'L8 — Fellow / VP' },
  { value: 'L9', label: 'L9 — Distinguished / SVP' },
]

const EQUITY_TYPES = [
  { value: 'RSU', label: 'RSU (Restricted Stock Units)' },
  { value: 'OPTIONS', label: 'Stock Options' },
  { value: 'ESOP', label: 'ESOP (Employee Stock Ownership)' },
  { value: 'PHANTOM', label: 'Phantom Stock' },
  { value: 'NONE', label: 'No Equity' },
]

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AUD', 'CAD', 'AED']
const EDUCATION = [
  { value: 'BACHELOR', label: "Bachelor's Degree" },
  { value: 'MASTER', label: "Master's Degree" },
  { value: 'PHD', label: 'PhD / Doctorate' },
  { value: 'BOOTCAMP', label: 'Bootcamp' },
  { value: 'SELF_TAUGHT', label: 'Self-Taught' },
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'OTHER', label: 'Other' },
]

interface FormData {
  // Step 1
  companyId: string
  companyName: string
  jobTitle: string
  roleTrack: string

  // Step 2
  universalLevel: string
  companyLevelCode: string

  // Step 3
  baseSalaryLocal: string
  currency: string
  signingBonus: string
  annualBonusTargetPct: string
  annualBonusActualUsd: string
  equityTotalUsd: string
  equityType: string
  equityVestingYears: string
  equityCliffMonths: string

  // Step 4
  yoeTotal: string
  yoeAtCompany: string
  education: string
  isNewOffer: boolean
  source: string
  effectiveDate: string
  notes: string
}

const INITIAL_FORM: FormData = {
  companyId: '', companyName: '', jobTitle: '', roleTrack: 'Engineering',
  universalLevel: 'L4', companyLevelCode: '',
  baseSalaryLocal: '', currency: 'USD',
  signingBonus: '', annualBonusTargetPct: '', annualBonusActualUsd: '',
  equityTotalUsd: '', equityType: 'RSU', equityVestingYears: '4', equityCliffMonths: '12',
  yoeTotal: '', yoeAtCompany: '0', education: 'BACHELOR',
  isNewOffer: true, source: 'SELF', effectiveDate: new Date().toISOString().split('T')[0],
  notes: '',
}

export function SubmitForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  const { companies } = useCompanySearch()
  const mutation = useSubmitCompensation()

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync({
        companyId: form.companyId,
        locationId: 'placeholder', // In full implementation, user selects from location search
        roleId: 'placeholder',     // In full implementation, user selects role taxonomy
        jobTitle: form.jobTitle,
        universalLevel: form.universalLevel as 'L1',
        companyLevelCode: form.companyLevelCode || undefined,
        baseSalaryLocal: Number(form.baseSalaryLocal),
        currency: form.currency,
        signingBonus: form.signingBonus ? Number(form.signingBonus) : undefined,
        annualBonusTargetPct: form.annualBonusTargetPct ? Number(form.annualBonusTargetPct) : undefined,
        annualBonusActualUsd: form.annualBonusActualUsd ? Number(form.annualBonusActualUsd) : undefined,
        equityTotalUsd: form.equityTotalUsd ? Number(form.equityTotalUsd) : undefined,
        equityType: form.equityType as 'RSU',
        equityVestingYears: Number(form.equityVestingYears),
        equityCliffMonths: Number(form.equityCliffMonths),
        yoeTotal: Number(form.yoeTotal),
        yoeAtCompany: Number(form.yoeAtCompany),
        education: form.education as 'BACHELOR',
        isNewOffer: form.isNewOffer,
        source: form.source as 'SELF',
        effectiveDate: new Date(form.effectiveDate).toISOString(),
        notes: form.notes || undefined,
      })
      setSubmitted(true)
    } catch {
      // Error handled by mutation state
    }
  }

  // Success screen
  if (submitted) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Submission Received!</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Your compensation data has been submitted and will be reviewed by our team within 24 hours.
          Thank you for helping the community!
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={() => { setForm(INITIAL_FORM); setStep(1); setSubmitted(false) }}>
            Submit Another
          </Button>
          <a href="/explore">
            <Button variant="default">Explore Data</Button>
          </a>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                i + 1 === step ? 'text-indigo-400' :
                i + 1 < step ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i + 1 < step ? 'bg-emerald-500/20 text-emerald-400' :
                i + 1 === step ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-600'
              }`}>
                {i + 1 < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{label}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">{STEP_LABELS[step - 1]}</h2>

        {/* STEP 1: Company + Role */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Company search */}
            <div className="relative">
              <label className="form-label">Company *</label>
              <input
                type="text"
                placeholder="Search company..."
                value={companyQuery || form.companyName}
                onChange={(e) => {
                  setCompanyQuery(e.target.value)
                  update('companyName', e.target.value)
                  setShowCompanyDropdown(true)
                }}
                className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                id="company-search"
              />
              {showCompanyDropdown && companies.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl">
                  {companies.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      className="w-full px-3 py-2.5 text-sm text-left text-slate-200 hover:bg-white/5 flex items-center gap-2"
                      onClick={() => {
                        update('companyId', c.id)
                        update('companyName', c.name)
                        setCompanyQuery(c.name)
                        setShowCompanyDropdown(false)
                      }}
                    >
                      <div className="h-6 w-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {c.name[0]}
                      </div>
                      {c.name}
                      {c.industry && <span className="text-slate-500 text-xs ml-auto">{c.industry}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="Job Title *"
              placeholder="e.g., Senior Software Engineer, Staff Engineer"
              value={form.jobTitle}
              onChange={(e) => update('jobTitle', e.target.value)}
              id="job-title"
            />

            <Select
              label="Role Track *"
              value={form.roleTrack}
              onChange={(e) => update('roleTrack', e.target.value)}
              id="role-track"
            >
              {['Engineering', 'Product', 'Design', 'Data', 'Business', 'Operations'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
        )}

        {/* STEP 2: Level */}
        {step === 2 && (
          <div className="space-y-4">
            <Select
              label="Universal Level *"
              value={form.universalLevel}
              onChange={(e) => update('universalLevel', e.target.value)}
              id="universal-level"
              helperText="Select the level that best matches the seniority, not just the title."
            >
              {UNIVERSAL_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>

            <Input
              label="Company-Specific Level Code"
              placeholder="e.g., L5, E5, SDE-III, Band C, Grade F"
              value={form.companyLevelCode}
              onChange={(e) => update('companyLevelCode', e.target.value)}
              id="company-level-code"
              helperText="Leave blank if you don't know the internal level code."
            />

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-300 space-y-1">
              <p className="font-semibold">Level Guide:</p>
              <p>L4 (Senior) = Google L5, Meta E5, Amazon SDE-III, Microsoft Senior SDE</p>
              <p>L5 (Staff) = Google L6, Meta E6, Amazon Principal SDE</p>
              <p>L3 (Mid) = Google L4, Meta E4, Infosys Band C, TCS Grade E</p>
            </div>
          </div>
        )}

        {/* STEP 3: Compensation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Base Salary *"
                type="number"
                placeholder="e.g., 2500000"
                value={form.baseSalaryLocal}
                onChange={(e) => update('baseSalaryLocal', e.target.value)}
                id="base-salary"
                helperText="In your local currency"
              />
              <Select
                label="Currency *"
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                id="currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Signing Bonus (USD)"
                type="number"
                placeholder="e.g., 50000"
                value={form.signingBonus}
                onChange={(e) => update('signingBonus', e.target.value)}
                id="signing-bonus"
              />
              <Input
                label="Annual Bonus Target (%)"
                type="number"
                placeholder="e.g., 15"
                value={form.annualBonusTargetPct}
                onChange={(e) => update('annualBonusTargetPct', e.target.value)}
                id="bonus-target-pct"
              />
            </div>

            <Input
              label="Annual Bonus Actual (USD, last year)"
              type="number"
              placeholder="Actual payout received last year"
              value={form.annualBonusActualUsd}
              onChange={(e) => update('annualBonusActualUsd', e.target.value)}
              id="bonus-actual"
            />

            <hr className="border-white/5" />

            <Input
              label="Total Equity Grant (USD)"
              type="number"
              placeholder="e.g., 400000 (total 4-year grant)"
              value={form.equityTotalUsd}
              onChange={(e) => update('equityTotalUsd', e.target.value)}
              id="equity-total"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Equity Type"
                value={form.equityType}
                onChange={(e) => update('equityType', e.target.value)}
                id="equity-type"
              >
                {EQUITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              <Input
                label="Vesting Period (years)"
                type="number"
                value={form.equityVestingYears}
                onChange={(e) => update('equityVestingYears', e.target.value)}
                id="vesting-years"
                min="1" max="10"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Context */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total YOE *"
                type="number"
                placeholder="Total years of experience"
                value={form.yoeTotal}
                onChange={(e) => update('yoeTotal', e.target.value)}
                id="yoe-total"
              />
              <Input
                label="YOE at This Company"
                type="number"
                placeholder="Years at this company"
                value={form.yoeAtCompany}
                onChange={(e) => update('yoeAtCompany', e.target.value)}
                id="yoe-company"
              />
            </div>

            <Select
              label="Highest Education"
              value={form.education}
              onChange={(e) => update('education', e.target.value)}
              id="education"
            >
              {EDUCATION.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </Select>

            <Select
              label="Data Source"
              value={form.source}
              onChange={(e) => update('source', e.target.value)}
              id="source"
              helperText="How did you get this data?"
            >
              <option value="SELF">Self-reported (current salary)</option>
              <option value="OFFER_LETTER">From an offer letter</option>
              <option value="PUBLIC">From public sources</option>
            </Select>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.isNewOffer}
                onClick={() => update('isNewOffer', !form.isNewOffer)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.isNewOffer ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                id="is-new-offer"
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    form.isNewOffer ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <label htmlFor="is-new-offer" className="text-sm text-slate-300">
                This is a new offer (not current salary)
              </label>
            </div>

            <Input
              label="Effective Date"
              type="date"
              value={form.effectiveDate}
              onChange={(e) => update('effectiveDate', e.target.value)}
              id="effective-date"
              helperText="When did this compensation take effect?"
            />

            <div>
              <label className="form-label" htmlFor="notes">Additional Notes (optional)</label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Any context that might be helpful (geography, team size, industry, etc.)"
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="glass-card p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Company</p>
                  <p className="text-white font-medium">{form.companyName || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Job Title</p>
                  <p className="text-white font-medium">{form.jobTitle || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Level</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="level">{form.universalLevel}</Badge>
                    {form.companyLevelCode && (
                      <span className="text-slate-400 text-xs">{form.companyLevelCode}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500">YOE</p>
                  <p className="text-white font-medium">{form.yoeTotal} years total</p>
                </div>
                <div>
                  <p className="text-slate-500">Base Salary</p>
                  <p className="text-white font-medium">
                    {form.currency} {Number(form.baseSalaryLocal || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Total Equity (4yr)</p>
                  <p className="text-white font-medium">
                    {form.equityTotalUsd ? formatUSD(Number(form.equityTotalUsd)) : '—'}
                    {form.equityType !== 'NONE' && ` (${form.equityType})`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Annual Bonus</p>
                  <p className="text-white font-medium">
                    {form.annualBonusActualUsd ? formatUSD(Number(form.annualBonusActualUsd)) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Source</p>
                  <p className="text-white font-medium">{form.source}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-800/40 rounded-lg p-3">
              🔒 Your submission is anonymous. We will never link this data to your personal identity without explicit consent. All submissions go through a moderation queue before being published.
            </p>

            {mutation.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {mutation.error.message}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep((s) => s + 1)} className="gap-2">
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={handleSubmit}
            isLoading={mutation.isPending}
            className="gap-2"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              'Submit Anonymously'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
