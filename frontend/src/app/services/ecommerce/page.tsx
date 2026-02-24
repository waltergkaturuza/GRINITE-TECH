'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function EcommercePage() {
  const value = [
    'Modern storefronts that load fast on low bandwidth',
    'Secure checkouts with local and international payment options',
    'Inventory, orders, and customer data in one place',
    'Support for subscriptions, digital products, and B2B pricing',
  ]

  const process = [
    'Commerce strategy & channel selection',
    'UX design for product discovery and checkout',
    'Integration with payments, logistics, and accounting',
    'Launch, A/B testing, and conversion optimisation',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-900 via-crimson-950 to-granite-800 text-white">
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <section className="grid gap-10 lg:grid-cols-2 items-center mb-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-rose-300 uppercase mb-3">
                E‑Commerce & Digital Products
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Sell products and services <span className="text-rose-300">beyond borders</span>.
              </h1>
              <p className="text-gray-200 text-lg mb-6">
                From B2C stores to B2B ordering portals and digital subscriptions, we design commerce
                experiences that feel trustworthy, fast, and local.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact?service=ecommerce"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-rose-400 text-granite-900 font-semibold hover:bg-rose-300 transition-colors"
                >
                  Plan an e‑commerce project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition-colors"
                >
                  View product examples
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-rose-200">
                What we focus on
              </h2>
              <ul className="space-y-3 text-sm text-gray-100">
                {value.map((v) => (
                  <li key={v} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-rose-300 mt-0.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Implementation process</h2>
              <ol className="space-y-3 text-gray-100 list-decimal list-inside">
                {process.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Platform options</h2>
              <p className="text-sm text-gray-100 mb-3">
                We select or build the right platform for your stage:
              </p>
              <ul className="space-y-2 text-sm text-gray-100">
                <li>• Custom headless commerce with Next.js and a modern backend</li>
                <li>• Shopify or WooCommerce for faster time‑to‑market</li>
                <li>• Marketplaces and multi‑vendor setups</li>
              </ul>
            </div>
          </section>

          <section className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-crimson-950 to-granite-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Ready to launch or upgrade your store?</h3>
                <p className="text-sm text-gray-200">
                  We’ll review your catalogue, current tools, and target markets, then propose a concrete plan.
                </p>
              </div>
              <Link
                href="/contact?service=ecommerce"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-rose-400 text-granite-900 font-semibold hover:bg-rose-300 transition-colors"
              >
                Talk to the team
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

