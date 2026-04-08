import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

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
  '/track-request',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/services/') || path.startsWith('/case-studies') ? 0.85 : 0.7,
  }))
}
