import type { MetadataRoute } from 'next'

import { getAllPosts } from '@/lib/posts'
import { SITE_URL, toIsoDateTime } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const essayEntries = getAllPosts().map((post) => ({
    url: `${SITE_URL}/essays/${post.slug}`,
    lastModified: new Date(toIsoDateTime(post.date)),
  }))

  return [
    {
      url: SITE_URL,
    },
    ...essayEntries,
  ]
}
