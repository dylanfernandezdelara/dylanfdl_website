import type { MetadataRoute } from 'next'

import { contentCanonicalPath, getPublishedEntries } from '@/lib/content'
import { SITE_URL, toIsoDateTime } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const writingEntries = getPublishedEntries().map((entry) => ({
    url: `${SITE_URL}${contentCanonicalPath(entry.kind, entry.slug)}`,
    lastModified: new Date(toIsoDateTime(entry.updated ?? entry.date)),
  }))

  return [
    {
      url: SITE_URL,
    },
    ...writingEntries,
  ]
}
