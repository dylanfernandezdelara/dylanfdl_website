import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ArticleShell from '@/components/article/ArticleShell'
import JsonLdScript from '@/components/JsonLdScript'
import {
  contentCanonicalPath,
  contentRegistryKey,
  getEntryBySlug,
  type ContentKind,
} from '@/lib/content'
import { loadContentModule } from '@/lib/content/registry.generated'
import { buildArticlePageJsonLd } from '@/lib/jsonLd'
import {
  OPEN_GRAPH_BASE,
  absoluteUrl,
  buildPageTitle,
  toIsoDateTime,
} from '@/lib/site'

type ArticlePageParams = {
  kind: ContentKind
  slug: string
}

function loadEntryOrNotFound(kind: ContentKind, slug: string) {
  try {
    return getEntryBySlug(kind, slug)
  } catch {
    return null
  }
}

export async function generateArticleMetadata({
  kind,
  slug,
}: ArticlePageParams): Promise<Metadata> {
  const entry = loadEntryOrNotFound(kind, slug)
  if (!entry) {
    return {}
  }

  const pageTitle = buildPageTitle({ title: entry.title })
  const canonicalPath = contentCanonicalPath(entry.kind, entry.slug)
  const articlePublishedIso = toIsoDateTime(entry.date)
  const ogImage = entry.ogImage
    ? [
        {
          url: absoluteUrl(entry.ogImage),
        },
      ]
    : OPEN_GRAPH_BASE.images

  return {
    title: {
      absolute: pageTitle,
    },
    description: entry.summary,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      type: 'article',
      title: pageTitle,
      description: entry.summary,
      url: absoluteUrl(canonicalPath),
      publishedTime: articlePublishedIso,
      modifiedTime: entry.updated ? toIsoDateTime(entry.updated) : undefined,
      images: ogImage,
    },
  }
}

export default async function ArticlePage({ kind, slug }: ArticlePageParams) {
  const entry = loadEntryOrNotFound(kind, slug)
  if (!entry) {
    notFound()
  }

  const moduleKey = contentRegistryKey(entry.kind, entry.slug)
  const contentModulePromise = loadContentModule(moduleKey)
  if (!contentModulePromise) {
    notFound()
  }

  const contentModule = await contentModulePromise
  const Content = contentModule.default
  const canonicalPath = contentCanonicalPath(entry.kind, entry.slug)
  const canonicalUrl = absoluteUrl(canonicalPath)
  const articlePublishedIso = toIsoDateTime(entry.date)

  return (
    <>
      <JsonLdScript
        data={buildArticlePageJsonLd({
          title: entry.title,
          description: entry.summary,
          canonicalUrl,
          datePublished: articlePublishedIso,
          dateModified: entry.updated ? toIsoDateTime(entry.updated) : undefined,
        })}
      />
      <ArticleShell entry={entry}>
        <Content />
      </ArticleShell>
    </>
  )
}
