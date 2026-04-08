import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'
import { absoluteUrl, getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Enterprise Systems Engineering Zimbabwe',
  description:
    'Quantis Technologies designs secure, scalable enterprise systems for government, NGOs, and corporates in Zimbabwe and Africa. Request a proposal or book a consultation.',
  keywords: [
    'enterprise systems engineering Zimbabwe',
    'government digital transformation',
    'NGO software Africa',
    'custom ERP Zimbabwe',
    'Quantis Technologies',
  ],
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    title: 'Enterprise Systems Engineering Zimbabwe | Quantis Technologies',
    description:
      'Secure, scalable digital systems for government, NGOs, and corporates across Zimbabwe and Africa.',
    locale: 'en_ZW',
    siteName: 'Quantis Technologies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Systems Engineering Zimbabwe | Quantis Technologies',
    description:
      'Secure, scalable digital systems for government, NGOs, and corporates across Zimbabwe and Africa.',
  },
}

export default function HomePage() {
  return <HomePageClient />
}
