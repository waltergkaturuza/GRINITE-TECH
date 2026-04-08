import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ChatbotWrapper from './components/chatbot/ChatbotWrapper'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, getSiteUrl } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = getSiteUrl()

const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Quantis Technologies',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
      description:
        'Enterprise systems engineering partner for government, NGOs, and corporates in Zimbabwe and Africa.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ZW',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Quantis Technologies',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-ZW',
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Enterprise Systems Engineering Zimbabwe | Quantis Technologies',
    template: '%s | Quantis Technologies',
  },
  description:
    'Systems engineering company delivering enterprise platforms, automation, data intelligence, and secure cloud infrastructure for governments and forward-thinking organizations.',
  keywords: [
    'systems engineering',
    'enterprise platforms',
    'government digital transformation',
    'cloud infrastructure',
    'Quantis Technologies',
  ],
  authors: [{ name: 'Quantis Technologies Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    siteName: 'Quantis Technologies',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JsonLd data={rootJsonLd} />
        <Providers>
          {children}
          {/* AI Chatbot - Available globally across all pages */}
          <ChatbotWrapper />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}