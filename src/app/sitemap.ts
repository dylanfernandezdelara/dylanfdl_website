import type { MetadataRoute } from 'next'

import { contentCanonicalPath, getPublishedEntries } from '@/lib/content'
import { SITE_URL, absoluteUrl, toIsoDateTime } from '@/lib/site'
import { SITE_DOCUMENTS } from '@/lib/siteDocuments'

export default function sitemap(): MetadataRoute.Sitemap {
  const writingEntries = getPublishedEntries().map((entry) => ({
    url: `${SITE_URL}${contentCanonicalPath(entry.kind, entry.slug)}`,
    lastModified: new Date(toIsoDateTime(entry.updated ?? entry.date)),
  }))

  const documentEntries = SITE_DOCUMENTS.map((document) => ({
    url: absoluteUrl(document.path),
  }))

  return [
    {
      url: SITE_URL,
    },
    ...documentEntries,
    ...writingEntries,
  ]
}
