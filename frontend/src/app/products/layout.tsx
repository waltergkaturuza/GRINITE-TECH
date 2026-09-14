import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import { QUANTIS_KEYWORDS } from '@/constants/company'

const pageUrl = absoluteUrl('/products')
const description =
  'Quantis Technologies products and platforms for enterprise operations, automation, data, and digital service delivery across Zimbabwe and Africa.'

export const metadata: Metadata = {
  title: 'Products & Digital Platforms',
  description,
  keywords: [...QUANTIS_KEYWORDS, 'Quantis Technologies products'],
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: 'Products & Digital Platforms | Quantis Technologies',
    description,
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products & Digital Platforms | Quantis Technologies',
    description,
    images: [defaultSocialImage.url],
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
