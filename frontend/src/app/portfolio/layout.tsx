import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import { QUANTIS_KEYWORDS } from '@/constants/company'

const pageUrl = absoluteUrl('/portfolio')
const description =
  'Quantis Technologies portfolio: technical skills, featured enterprise systems, government and NGO platforms, and how to partner on digital transformation in Zimbabwe and Africa.'

export const metadata: Metadata = {
  title: 'Portfolio & Technical Skills',
  description,
  keywords: [
    ...QUANTIS_KEYWORDS,
    'Quantis Technologies portfolio',
    'enterprise software case work Zimbabwe',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: 'Portfolio & Technical Skills | Quantis Technologies',
    description,
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio & Technical Skills | Quantis Technologies',
    description,
    images: [defaultSocialImage.url],
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children
}
