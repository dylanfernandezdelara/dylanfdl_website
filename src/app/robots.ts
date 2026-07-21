import type { MetadataRoute } from 'next'

import { SITEMAP_INDEX_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: SITEMAP_INDEX_URL,
  }
}
