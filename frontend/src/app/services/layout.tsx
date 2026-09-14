import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import { QUANTIS_KEYWORDS } from '@/constants/company'

const pageUrl = absoluteUrl('/services')
const description =
  'Quantis Technologies services: enterprise systems engineering, cloud and DevOps, data intelligence, process automation, cybersecurity and compliance, and digital platform development in Zimbabwe and Africa.'

export const metadata: Metadata = {
  title: 'Enterprise Software Services Zimbabwe',
  description,
  keywords: [
    ...QUANTIS_KEYWORDS,
    'software development services Zimbabwe',
    'custom software Harare',
    'business automation Africa',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: 'Enterprise Software Services | Quantis Technologies',
    description,
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Software Services | Quantis Technologies',
    description,
    images: [defaultSocialImage.url],
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
