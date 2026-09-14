import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'
import { absoluteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import { QUANTIS_DESCRIPTION, QUANTIS_KEYWORDS } from '@/constants/company'

const pageUrl = absoluteUrl('/')

export const metadata: Metadata = {
  title: 'Enterprise Systems Engineering Zimbabwe',
  description: QUANTIS_DESCRIPTION,
  keywords: [...QUANTIS_KEYWORDS],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Enterprise Systems Engineering Zimbabwe | Quantis Technologies',
    description: QUANTIS_DESCRIPTION,
    locale: 'en_ZW',
    siteName: 'Quantis Technologies',
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Systems Engineering Zimbabwe | Quantis Technologies',
    description: QUANTIS_DESCRIPTION,
    images: [defaultSocialImage.url],
  },
}

export default function HomePage() {
  return <HomePageClient />
}
