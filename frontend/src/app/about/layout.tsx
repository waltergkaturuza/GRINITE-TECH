import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import { QUANTIS_KEYWORDS } from '@/constants/company'

const pageUrl = absoluteUrl('/about')
const description =
  'Quantis Technologies is a Harare systems engineering partner for government, NGOs, and corporates across Zimbabwe and Africa — enterprise platforms, cloud, data, automation, and cybersecurity.'

export const metadata: Metadata = {
  title: 'About Quantis Technologies',
  description,
  keywords: [...QUANTIS_KEYWORDS, 'about Quantis Technologies Harare'],
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: 'About Quantis Technologies',
    description,
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Quantis Technologies',
    description,
    images: [defaultSocialImage.url],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
