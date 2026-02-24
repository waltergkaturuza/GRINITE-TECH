'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function CustomSoftwarePage() {
  const benefits = [
    'Replace fragile spreadsheets and manual workflows with robust systems',
    'Unify data across departments for real‑time visibility',
    'Design UX around your actual teams and processes',
    'Build on modern, cloud‑ready architecture for future growth',
  ]

  const process = [
    'Discovery & requirements mapping',
    'UX flows and clickable prototypes',
    'Incremental development with demos',
    'User acceptance testing & training',
    'Launch, monitoring, and continuous improvement',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-900 to-crimson-950 text-white">
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="grid gap-10 lg:grid-cols-2 items-center mb-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-amber-300 uppercase mb-3">
                Custom Software Development
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Systems engineered around <span className="text-amber-300">your business</span>.
              </h1>
              <p className="text-gray-200 text-lg mb-6">
                We design and build web and cloud applications that match the way your organisation
                actually works — not the other way around.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact?service=custom-software"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-amber-500 text-granite-900 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Start a custom project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition-colors"
                >
                  View case studies
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-amber-200">
                Ideal for organisations who:
              </h2>
              <ul className="space-y-3 text-sm text-gray-100">
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span>Have outgrown off‑the‑shelf tools and need tailored workflows.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span>Need to connect multiple systems (ERP, CRM, payments, internal tools).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span>Require secure, auditable platforms for government, NGO, or enterprise work.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Benefits & Process */}
          <section className="grid gap-10 lg:grid-cols-2 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">What you gain</h2>
              <ul className="space-y-3 text-gray-100">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Our delivery approach</h2>
              <ol className="space-y-3 text-gray-100 list-decimal list-inside">
                {process.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </section>

          {/* CTA */}
          <section className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-granite-900 to-crimson-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Ready to replace legacy systems?</h3>
                <p className="text-sm text-gray-200">
                  Share your requirements and we’ll respond with a proposed roadmap within 24 hours.
                </p>
              </div>
              <Link
                href="/contact?service=custom-software"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-granite-900 font-semibold hover:bg-amber-400 transition-colors"
              >
                Book a discovery call
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

