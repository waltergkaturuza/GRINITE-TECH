import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'

const siteUrl = getSiteUrl()
const path = '/case-studies/fuel-coupon-management-system'
const pageUrl = absoluteUrl(path)
const published = '2026-04-08'

export const metadata: Metadata = {
  title: 'Fuel Coupon Management System Case Study',
  description:
    'How Quantis built a multi-level fuel coupon management platform with approvals, audit trails, and reporting for a public-sector institution.',
  keywords: [
    'fuel coupon management',
    'government case study',
    'enterprise systems Zimbabwe',
    'Quantis Technologies',
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: 'article',
    url: pageUrl,
    title: 'Fuel Coupon Management System Case Study | Quantis Technologies',
    description:
      'Institutional fuel allocation digitized with governance, controls, and audit-ready operations.',
    publishedTime: published,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fuel Coupon Management System Case Study | Quantis Technologies',
    description:
      'Institutional fuel allocation digitized with governance, controls, and audit-ready operations.',
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${pageUrl}#article`,
      headline: 'Fuel Coupon Management System for a Public-Sector Institution',
      description:
        'Case study: enterprise fuel coupon platform with multi-level approvals, traceability, and reporting for institutional accountability.',
      author: { '@id': `${siteUrl}/#organization` },
      publisher: { '@id': `${siteUrl}/#organization` },
      datePublished: published,
      dateModified: published,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      inLanguage: 'en-ZW',
      articleSection: 'Case Studies',
      about: [
        { '@type': 'Thing', name: 'Fuel management systems' },
        { '@type': 'Thing', name: 'Government digital transformation' },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Case Studies', item: absoluteUrl('/case-studies') },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Fuel Coupon Management System',
          item: pageUrl,
        },
      ],
    },
  ],
}

export default function FuelCouponCaseStudyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-900 to-crimson-950 text-white">
      <JsonLd data={articleJsonLd} />
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-amber-300 uppercase mb-3">Case study</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Fuel coupon management system for a public-sector institution
          </h1>
          <p className="text-gray-300 text-sm mb-10">
            Public-sector institution · Government / institutional operations · Enterprise platform
          </p>

          <section className="prose prose-invert prose-lg max-w-none mb-12">
            <h2 className="text-xl font-semibold text-white not-prose mb-3">Challenge</h2>
            <p className="text-gray-200">
              The institution relied on fragmented, mostly manual fuel coupon processes across multiple
              departments. Visibility gaps, inconsistent approvals, and reporting delays increased
              operational risk. Leadership required stronger governance, real-time oversight, and auditable
              control over allocation and redemption.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-3">Existing limitations</h2>
            <ul className="space-y-2 text-gray-200">
              {[
                'Manual workflows with limited traceability',
                'Inconsistent approval procedures across units',
                'Delayed reconciliation and reporting cycles',
                'High operational risk from weak policy enforcement',
                'Limited management visibility into anomalies and trends',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-3">Solution</h2>
            <p className="text-gray-200 mb-4">
              Quantis engineered a centralized fuel coupon management platform with configurable workflows,
              role-based controls, and end-to-end transaction traceability.
            </p>
            <h3 className="text-lg font-medium text-amber-200 mb-2">Delivered modules</h3>
            <ul className="space-y-2 text-gray-200">
              {[
                'Allocation policy configuration',
                'Multi-step approvals by role and threshold',
                'Coupon/token issuance and redemption tracking',
                'Department and branch-level monitoring dashboards',
                'Reconciliation and audit reporting tools',
                'Administrative controls and user governance',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-3">Architecture & security approach</h2>
            <p className="text-gray-200 mb-4">
              The system was designed as a secure, modular enterprise platform to support growth,
              governance, and integration.
            </p>
            <ul className="space-y-2 text-gray-200">
              {[
                'Role-based access and segregation of duties',
                'Immutable transaction logs for accountability',
                'Configurable workflow rules aligned to policy',
                'Reporting layer for operational and executive oversight',
                'Integration-ready services for finance and operational systems',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-3">Outcomes</h2>
            <ul className="space-y-2 text-gray-200">
              {[
                'Improved control over the fuel allocation lifecycle',
                'Faster reporting and reconciliation turnaround',
                'Increased audit readiness and governance confidence',
                'Better visibility for management decision-making',
                'Reduced process leakage through stronger controls',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-granite-900 to-crimson-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Planning a similar initiative?</h3>
                <p className="text-sm text-gray-200">
                  We design secure, scalable systems tailored to your institutional structure.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact?service=fuel-management"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-granite-900 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Discuss this project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/services/fuel-management-system-africa"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition-colors"
                >
                  Service overview
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
