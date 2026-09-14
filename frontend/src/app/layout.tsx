import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ChatbotWrapper from './components/chatbot/ChatbotWrapper'
import JsonLd from '@/components/seo/JsonLd'
import { getSiteUrl } from '@/lib/site'
import { defaultSocialImage, getRootJsonLd } from '@/lib/seo'
import {
  QUANTIS_APPLE_ICON_URL,
  QUANTIS_DESCRIPTION,
  QUANTIS_ICON_192_URL,
  QUANTIS_KEYWORDS,
  QUANTIS_MARK_PNG_URL,
} from '@/constants/company'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = getSiteUrl()
const rootJsonLd = getRootJsonLd()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Quantis Technologies',
  title: {
    default: 'Enterprise Systems Engineering Zimbabwe | Quantis Technologies',
    template: '%s | Quantis Technologies',
  },
  description: QUANTIS_DESCRIPTION,
  keywords: [...QUANTIS_KEYWORDS],
  authors: [{ name: 'Quantis Technologies', url: siteUrl }],
  creator: 'Quantis Technologies',
  publisher: 'Quantis Technologies',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: QUANTIS_ICON_192_URL, sizes: '192x192', type: 'image/png' },
      { url: QUANTIS_MARK_PNG_URL, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: QUANTIS_APPLE_ICON_URL, sizes: '180x180', type: 'image/png' }],
    shortcut: QUANTIS_MARK_PNG_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    url: siteUrl,
    siteName: 'Quantis Technologies',
    title: 'Quantis Technologies | Enterprise Systems Engineering Zimbabwe',
    description: QUANTIS_DESCRIPTION,
    images: [defaultSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantis Technologies | Enterprise Systems Engineering Zimbabwe',
    description: QUANTIS_DESCRIPTION,
    images: [defaultSocialImage.url],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('qt_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.style.colorScheme='light';}var lang=localStorage.getItem('qt_lang');if(!lang||lang==='en'){var host=location.hostname;var expire='Thu, 01 Jan 1970 00:00:00 GMT';var domains=['',host,'.'+host];var parts=host.split('.');if(parts.length>=2)domains.push('.'+parts.slice(-2).join('.'));for(var i=0;i<domains.length;i++){var extra=domains[i]?';domain='+domains[i]:'';document.cookie='googtrans=;path=/'+extra+';expires='+expire;document.cookie='googtrans=/en/en;path=/'+extra;}document.documentElement.lang='en';document.documentElement.setAttribute('translate','no');document.documentElement.classList.remove('translated-ltr','translated-rtl');}else{document.documentElement.setAttribute('translate','yes');}}catch(e){}})();`,
          }}
        />
      </head>
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
