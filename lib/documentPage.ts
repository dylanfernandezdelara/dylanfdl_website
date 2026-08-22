import type { Metadata } from 'next'

import { OPEN_GRAPH_BASE, absoluteUrl, buildPageTitle } from '@/lib/site'

export function documentPageMetadata(options: {
  path: string
  title: string
  description: string
}): Metadata {
  const canonicalUrl = absoluteUrl(options.path)
  const pageTitle = buildPageTitle({ title: options.title })

  return {
    title: pageTitle,
    description: options.description,
    alternates: {
      canonical: options.path,
      types: {
        'text/markdown': options.path,
      },
    },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      type: 'website',
      title: pageTitle,
      description: options.description,
      url: canonicalUrl,
    },
  }
}
