import type { MetadataRoute } from 'next'

import { contentCanonicalPath, getPublishedEntries } from '@/lib/content'
import { SITE_DOCUMENT_LINKS, SITE_URL, absoluteUrl, toIsoDateTime } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const writingEntries = getPublishedEntries().map((entry) => ({
    url: `${SITE_URL}${contentCanonicalPath(entry.kind, entry.slug)}`,
    lastModified: new Date(toIsoDateTime(entry.updated ?? entry.date)),
  }))

  const documentEntries = SITE_DOCUMENT_LINKS.map((link) => ({
    url: absoluteUrl(link.href),
  }))

  return [
    {
      url: SITE_URL,
    },
    ...documentEntries,
    ...writingEntries,
  ]
}
