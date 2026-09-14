import type { MetadataRoute } from 'next'
import { QUANTIS_MARK_PNG_URL } from '@/constants/company'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quantis Technologies',
    short_name: 'Quantis',
    description:
      'Enterprise systems, cloud and DevOps, data intelligence, automation, cybersecurity, and digital platforms for Zimbabwe and Africa.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7f1d1d',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: QUANTIS_MARK_PNG_URL,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
