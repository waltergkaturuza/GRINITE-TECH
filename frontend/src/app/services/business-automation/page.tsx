'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function BusinessAutomationPage() {
  const pains = [
    'Teams re‑typing the same data into multiple systems',
    'Approvals and requests stuck in email or WhatsApp threads',
    'No single source of truth for operations or finances',
    'Leaders making decisions on stale, manual reports',
  ]

  const automations = [
    'Workflow engines for approvals, onboarding, and internal requests',
    'Integration between accounting, CRM, HR, and inventory tools',
    'Dashboards that surface real‑time KPIs and alerts',
    'Document and records management with proper access control',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-900 via-granite-950 to-jungle-900 text-white">
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <section className="grid gap-10 lg:grid-cols-2 items-center mb-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-emerald-300 uppercase mb-3">
                Business Process Automation
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Take the manual work out of <span className="text-emerald-300">everyday operations</span>.
              </h1>
              <p className="text-gray-200 text-lg mb-6">
                We map your current processes, remove unnecessary steps, and implement digital workflows
                that are fast, auditable, and easy for teams to adopt.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact?service=business-automation"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-400 text-granite-900 font-semibold hover:bg-emerald-300 transition-colors"
                >
                  Automate a workflow
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition-colors"
                >
                  See analytics capabilities
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-emerald-200">
                Common pain points we solve
              </h2>
              <ul className="space-y-3 text-sm text-gray-100">
                {pains.map((p) => (
                  <li key={p} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-emerald-300 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">What we automate</h2>
              <ul className="space-y-3 text-gray-100">
                {automations.map((a) => (
                  <li key={a} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-emerald-300 mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">How we work</h2>
              <ol className="space-y-3 text-gray-100 list-decimal list-inside">
                <li>Process discovery workshop and current‑state mapping.</li>
                <li>Identify quick wins vs. deeper redesigns.</li>
                <li>Prototype, test with real teams, then roll out gradually.</li>
                <li>Train champions in each department and refine KPIs.</li>
              </ol>
            </div>
          </section>

          <section className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-granite-950 to-jungle-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Want to see what can be automated?</h3>
                <p className="text-sm text-gray-200">
                  We’ll review one of your core processes and suggest a concrete automation roadmap.
                </p>
              </div>
              <Link
                href="/contact?service=business-automation"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-400 text-granite-900 font-semibold hover:bg-emerald-300 transition-colors"
              >
                Request an automation audit
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

