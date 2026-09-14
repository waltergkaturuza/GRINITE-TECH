import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import {
  QUANTIS_APPLE_ICON_URL,
  QUANTIS_ICON_192_URL,
  QUANTIS_LOGO_PNG_URL,
  QUANTIS_MARK_PNG_URL,
  QUANTIS_OG_IMAGE_URL,
} from '@/constants/company'

export default function robots(): MetadataRoute.Robots {
  const brandAssets = [
    QUANTIS_LOGO_PNG_URL,
    QUANTIS_MARK_PNG_URL,
    QUANTIS_OG_IMAGE_URL,
    QUANTIS_ICON_192_URL,
    QUANTIS_APPLE_ICON_URL,
    '/QUANTIS-1.svg',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', ...brandAssets],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/login',
          '/signup',
          '/forgot-password',
          '/checkout',
          '/cart',
          '/debug/',
          '/test/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', ...brandAssets],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: 'www.quantistechnologies.co.zw',
  }
}
