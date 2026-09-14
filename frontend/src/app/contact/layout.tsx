import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import { COMPANY_CONTACT, QUANTIS_KEYWORDS } from '@/constants/company'

const pageUrl = absoluteUrl('/contact')
const description = `Talk to Quantis Technologies in Harare about enterprise systems, cloud, data, automation, or cybersecurity. ${COMPANY_CONTACT.addressLine1}, ${COMPANY_CONTACT.addressLine2}.`

export const metadata: Metadata = {
  title: 'Contact Quantis Technologies',
  description,
  keywords: [...QUANTIS_KEYWORDS, 'contact Quantis Technologies Harare'],
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: 'Contact Quantis Technologies',
    description,
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Quantis Technologies',
    description,
    images: [defaultSocialImage.url],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
