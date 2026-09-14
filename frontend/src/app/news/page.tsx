import type { Metadata } from 'next'
import PublicPage from '@/components/PublicPage'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { defaultSocialImage } from '@/lib/seo'
import NewsHub from './NewsHub'

const pageUrl = absoluteUrl('/news')
const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'News & Updates',
  description:
    'Quantis Technologies news, product updates, promotions, engineering notes, and a community research desk.',
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'News & Updates | Quantis Technologies',
    description:
      'Read launches and research, then add a question, a view, or a field-tested contribution.',
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News & Updates | Quantis Technologies',
    images: [defaultSocialImage.url],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Quantis News & Updates',
  url: pageUrl,
  publisher: { '@id': `${siteUrl}/#organization` },
}

export default function NewsPage() {
  return (
    <PublicPage>
      <JsonLd data={jsonLd} />
      <NewsHub />
    </PublicPage>
  )
}
