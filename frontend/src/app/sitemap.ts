import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { QUANTIS_LOGO_PNG_URL, QUANTIS_OG_IMAGE_URL } from '@/constants/company'

const staticPaths = [
  '/',
  '/about',
  '/contact',
  '/portfolio',
  '/services',
  '/services/custom-software',
  '/services/mobile-apps',
  '/services/business-automation',
  '/services/ecommerce',
  '/services/fuel-management-system-africa',
  '/case-studies',
  '/case-studies/fuel-coupon-management-system',
  '/products',
  '/news',
  '/track-request',
]

const brandImages = [QUANTIS_LOGO_PNG_URL, QUANTIS_OG_IMAGE_URL]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return staticPaths.map((path) => {
    const entry: MetadataRoute.Sitemap[number] & { images?: string[] } = {
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : path.startsWith('/services/') || path.startsWith('/case-studies') ? 0.85 : 0.7,
    }

    if (path === '/') {
      entry.images = brandImages.map((image) => absoluteUrl(image))
    }

    return entry
  })
}
