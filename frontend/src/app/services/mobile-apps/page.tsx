'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function MobileAppsPage() {
  const benefits = [
    'Reach customers on Android, iOS, and web with a single codebase',
    'Offer offline‑first experiences for low‑connectivity environments',
    'Integrate with existing systems (payments, CRM, ERP, support)',
    'Push notifications to drive engagement and retention',
  ]

  const useCases = [
    'Client self‑service apps',
    'Field‑worker tools and inspections',
    'E‑commerce and ordering apps',
    'Event and community engagement',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-900 via-jungle-900 to-crimson-950 text-white">
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <section className="grid gap-10 lg:grid-cols-2 items-center mb-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-cyan-300 uppercase mb-3">
                Mobile App Development
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Experiences your users carry in their <span className="text-cyan-300">pocket</span>.
              </h1>
              <p className="text-gray-200 text-lg mb-6">
                We build cross‑platform mobile apps tailored to African connectivity realities —
                lightweight, fast, and deeply integrated with your backend systems.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact?service=mobile-apps"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-cyan-400 text-granite-900 font-semibold hover:bg-cyan-300 transition-colors"
                >
                  Discuss a mobile app
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition-colors"
                >
                  Explore all services
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-cyan-200">
                Perfect for:
              </h2>
              <ul className="space-y-3 text-sm text-gray-100">
                {useCases.map((u) => (
                  <li key={u} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-cyan-300 mt-0.5" />
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Why teams choose Quantis</h2>
              <ul className="space-y-3 text-gray-100">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-cyan-300 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Technology stack</h2>
              <p className="text-sm text-gray-100 mb-3">
                We typically use:
              </p>
              <ul className="space-y-2 text-sm text-gray-100">
                <li>• React Native or Flutter for cross‑platform apps</li>
                <li>• NestJS / Node.js or Laravel for APIs</li>
                <li>• PostgreSQL / Neon for data storage</li>
                <li>• Firebase / OneSignal for notifications</li>
              </ul>
            </div>
          </section>

          <section className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-jungle-900 to-granite-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Have an app idea or existing MVP?</h3>
                <p className="text-sm text-gray-200">
                  We’ll help you refine the roadmap, UX, and release plan — from pilot to production.
                </p>
              </div>
              <Link
                href="/contact?service=mobile-apps"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-400 text-granite-900 font-semibold hover:bg-cyan-300 transition-colors"
              >
                Schedule product workshop
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

