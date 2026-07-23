import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ArticlePage, { generateArticleMetadata } from '@/components/article/ArticlePage'
import { getEntriesByKind, type ContentKind } from '@/lib/content'

type ContentPageProps = {
  params: Promise<{ slug: string }>
}

export function createContentPage(kind: ContentKind) {
  return {
    // Only allow slugs from generateStaticParams — unknown URLs 404 instead of
    // on-demand rendering that can throw on invalid frontmatter.
    dynamicParams: false as const,
    generateStaticParams() {
      return getEntriesByKind(kind).map(({ slug }) => ({ slug }))
    },
    async generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
      const { slug } = await params
      try {
        return await generateArticleMetadata({ kind, slug })
      } catch {
        return {}
      }
    },
    async Page({ params }: ContentPageProps) {
      const { slug } = await params
      try {
        return await ArticlePage({ kind, slug })
      } catch {
        notFound()
      }
    },
  }
}
