import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'

const siteUrl = getSiteUrl()
const path = '/services/fuel-management-system-africa'
const pageUrl = absoluteUrl(path)

export const metadata: Metadata = {
  title: 'Fuel Management System Solutions Africa',
  description:
    'Enterprise fuel allocation, coupon management, and audit-ready reporting for government and large institutions. Technical architecture and delivery by Quantis Technologies.',
  keywords: [
    'fuel management system Africa',
    'fuel coupon system Zimbabwe',
    'government fuel allocation',
    'enterprise fuel tracking',
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Fuel Management System Solutions Africa | Quantis Technologies',
    description:
      'Digitize fuel allocation, approvals, redemption, and reporting with role-based controls and full audit trails.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fuel Management System Solutions Africa | Quantis Technologies',
    description:
      'Digitize fuel allocation, approvals, redemption, and reporting with role-based controls and full audit trails.',
  },
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: 'Fuel Management System Solutions',
      serviceType: 'Enterprise software development',
      description:
        'Fuel allocation, coupon and voucher management, workflow approvals, dashboards, reconciliation, and audit-ready reporting for government and enterprise institutions.',
      provider: { '@id': `${siteUrl}/#organization` },
      areaServed: [{ '@type': 'Country', name: 'Zimbabwe' }, { '@type': 'Place', name: 'Africa' }],
      audience: {
        '@type': 'BusinessAudience',
        audienceType: 'Government agencies, NGOs, corporates',
      },
      url: pageUrl,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Services', item: absoluteUrl('/services') },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Fuel Management Systems',
          item: pageUrl,
        },
      ],
    },
  ],
}

const capabilities = [
  'Multi-level allocation workflows',
  'Role-based access control and approval matrices',
  'Coupon/token issuance and tracking',
  'Real-time dashboards and exception alerts',
  'Audit trails and compliance reporting',
  'Integration with finance, HR, and fleet systems',
]

const phases = [
  'Process mapping and requirements discovery',
  'Architecture and controls design',
  'System configuration and integration',
  'Pilot rollout and user acceptance testing',
  'Full deployment, training, and support',
]

export default function FuelManagementAfricaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-900 to-crimson-950 text-white">
      <JsonLd data={serviceJsonLd} />
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <section className="grid gap-10 lg:grid-cols-2 items-center mb-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-amber-300 uppercase mb-3">
                Institutional fuel systems
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Fuel management for{' '}
                <span className="text-amber-300">government & enterprise</span> in Africa
              </h1>
              <p className="text-gray-200 text-lg mb-6">
                End-to-end fuel allocation platforms that improve control, reduce leakage, and strengthen
                auditability—with secure, real-time visibility across departments and regions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact?service=fuel-management"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-amber-500 text-granite-900 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Schedule technical consultation
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies/fuel-coupon-management-system"
                  className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition-colors"
                >
                  View related case study
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-amber-200">Who this is for</h2>
              <ul className="space-y-3 text-sm text-gray-100">
                {[
                  'Government ministries and departments',
                  'State-owned entities',
                  'Transport and logistics-heavy institutions',
                  'Large NGOs and enterprise operations',
                ].map((line) => (
                  <li key={line} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Challenges we solve</h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-gray-100">
              {[
                'Manual fuel voucher processes with weak accountability',
                'Limited visibility into allocation, redemption, and consumption',
                'Fraud and leakage from poor controls and disconnected approvals',
                'Delayed reporting and weak audit readiness',
                'Inconsistent policy enforcement across branches',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-10 lg:grid-cols-2 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Solution overview</h2>
              <p className="text-gray-200 mb-4">
                Digitize the full lifecycle of fuel allocation: policy definition, approvals, issuance,
                redemption, reconciliation, and reporting—configurable to your governance model.
              </p>
              <h3 className="text-lg font-medium text-amber-200 mb-2">Core capabilities</h3>
              <ul className="space-y-2 text-gray-100">
                {capabilities.map((c) => (
                  <li key={c} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Architecture & security</h2>
              <p className="text-gray-200 text-sm mb-4">
                Modular architecture with secure APIs, centralized policy controls, and analytics-ready
                data pipelines. Supports web administration, branch operations, and controlled enterprise
                integrations.
              </p>
              <ul className="space-y-2 text-sm text-gray-100">
                {[
                  'Secure authentication and authorization',
                  'Workflow engine for configurable approvals',
                  'Transaction traceability for oversight',
                  'Reporting for operational and executive teams',
                  'Cloud or hybrid deployment options',
                ].map((line) => (
                  <li key={line} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Implementation phases</h2>
            <ol className="space-y-2 text-gray-100 list-decimal list-inside">
              {phases.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-granite-900 to-crimson-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Need a fuel control platform?</h3>
                <p className="text-sm text-gray-200">
                  We map your requirements into a practical architecture and delivery plan.
                </p>
              </div>
              <Link
                href="/contact?service=fuel-management"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-granite-900 font-semibold hover:bg-amber-400 transition-colors"
              >
                Schedule technical consultation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
