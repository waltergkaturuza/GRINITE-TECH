import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const pageUrl = absoluteUrl('/case-studies')
const siteUrl = getSiteUrl()

const caseStudiesIndexJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#webpage`,
      name: 'Case Studies',
      url: pageUrl,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-ZW',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Case Studies', item: pageUrl },
      ],
    },
  ],
}

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'Enterprise systems engineering case studies from Quantis Technologies—government, NGO, and institutional platforms.',
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Case Studies | Quantis Technologies',
    description:
      'How we deliver secure, scalable digital systems for mission-critical institutional operations.',
  },
}

export default function CaseStudiesIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-900 to-crimson-950 text-white">
      <JsonLd data={caseStudiesIndexJsonLd} />
      <Navigation />

      <main className="pt-28 pb-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Case studies</h1>
          <p className="text-gray-200 text-lg max-w-2xl mb-12">
            Evidence of how we design and ship enterprise systems for institutions that cannot afford fragile
            software.
          </p>

          <ul className="space-y-6 max-w-3xl">
            <li>
              <Link
                href="/case-studies/fuel-coupon-management-system"
                className="group block rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/40 transition-colors"
              >
                <h2 className="text-xl font-semibold text-white group-hover:text-amber-200 mb-2">
                  Fuel coupon management system
                </h2>
                <p className="text-gray-300 text-sm mb-4">
                  Multi-level approvals, traceability, and audit-ready reporting for a public-sector fuel
                  allocation program.
                </p>
                <span className="inline-flex items-center text-amber-400 text-sm font-medium">
                  Read case study
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
