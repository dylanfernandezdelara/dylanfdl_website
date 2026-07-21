import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import JsonLdScript from '@/components/JsonLdScript'
import { buildEssayPageJsonLd } from '@/lib/jsonLd'
import { formatPostDate, getPostBySlug, getPostSlugs } from '@/lib/posts'
import {
  OPEN_GRAPH_BASE,
  PERSON_NAME,
  absoluteUrl,
  buildPageTitle,
  toIsoDateTime,
} from '@/lib/site'

type EssayPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {}
  }

  const pageTitle = buildPageTitle({ title: post.title })
  const canonicalPath = `/essays/${post.slug}`
  const articlePublishedIso = toIsoDateTime(post.date)

  return {
    title: {
      absolute: pageTitle,
    },
    description: post.excerpt,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      type: 'article',
      title: pageTitle,
      description: post.excerpt,
      url: absoluteUrl(canonicalPath),
      publishedTime: articlePublishedIso,
    },
  }
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const processedContent = await remark().use(remarkHtml).process(post.content)
  const contentHtml = processedContent.toString()

  const wordCount = post.content.split(/\s+/).filter((word) => word.length > 0).length
  const showExcerpt = post.excerpt && wordCount > 500

  const canonicalPath = `/essays/${post.slug}`
  const canonicalUrl = absoluteUrl(canonicalPath)
  const articlePublishedIso = toIsoDateTime(post.date)

  return (
    <>
      <JsonLdScript
        data={buildEssayPageJsonLd({
          title: post.title,
          description: post.excerpt,
          canonicalUrl,
          datePublished: articlePublishedIso,
        })}
      />
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 pt-12 text-sm min-[481px]:px-6 md:px-8 md:pt-16">
        <Link
          href="/"
          className="font-serif font-normal text-fg0 transition-colors duration-150 hover:text-fg2"
        >
          {PERSON_NAME}
        </Link>
        <nav aria-label="Site" className="flex items-center gap-5 text-fg3">
          <Link href="/" className="transition-colors duration-150 hover:text-fg0">
            Home
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-reading px-4 min-[481px]:px-6 md:px-8">
        <article className="grid gap-0">
          <header className="mt-12 flex flex-col gap-4 text-center md:mt-16">
            <h1 className="m-0 text-balance font-serif text-2xl font-normal leading-tight text-fg0">
              {post.title}
            </h1>

            {showExcerpt && (
              <p className="text-pretty mx-auto max-w-[55ch] text-sm italic leading-relaxed text-fg2">
                {post.excerpt}
              </p>
            )}

            <p className="text-sm text-fg3">{formatPostDate(post.date)}</p>
          </header>

          <div
            className="mt-10 grid gap-5 text-base leading-[1.7] text-fg1"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </>
  )
}
