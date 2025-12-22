import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPostSlugs, formatPostDate } from '@/lib/posts'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post not found',
    }
  }
  
  return {
    title: post.title,
  }
}

export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

const CONTENT_WRAPPER_STYLE: CSSProperties = {
  paddingTop: '3.25rem',
  paddingBottom: '4.5rem',
}

const ARTICLE_LAYOUT_STYLE: CSSProperties = {
  display: 'grid',
  gap: '1.75rem',
}

const ARTICLE_HEADER_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  maxWidth: '60ch',
}

const ARTICLE_TITLE_STYLE: CSSProperties = {
  fontSize: '1.875rem',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  margin: 0,
  color: 'var(--yellow)',
}

const ARTICLE_DATE_STYLE: CSSProperties = {
  fontSize: '0.9375rem',
  color: 'var(--fg2)',
}

const ARTICLE_DIVIDER_STYLE: CSSProperties = {
  height: '1px',
  width: '100%',
  backgroundColor: 'var(--bg2)',
}

const ARTICLE_CONTENT_STYLE: CSSProperties = {
  fontSize: '1.02rem',
  lineHeight: '1.7',
  color: 'var(--fg1)',
  display: 'grid',
  gap: '1.25rem',
}

const BACK_LINK_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  color: 'var(--fg2)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.9375rem',
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const processedContent = await remark()
    .use(remarkHtml)
    .process(post.content)
  const contentHtml = processedContent.toString()

  return (
    <>
      <div className="content-wrapper" style={CONTENT_WRAPPER_STYLE}>
        <article style={ARTICLE_LAYOUT_STYLE}>
          <Link
            href="/about"
            className="essay-back-link"
            style={BACK_LINK_STYLE}
            aria-label="Back to about"
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </Link>

          <header style={ARTICLE_HEADER_STYLE}>
            <h1 style={ARTICLE_TITLE_STYLE}>
              {post.title}
            </h1>

            <p style={ARTICLE_DATE_STYLE}>
              {formatPostDate(post.date)}
            </p>
          </header>

          <div style={ARTICLE_DIVIDER_STYLE} aria-hidden="true" />

          <div
            style={ARTICLE_CONTENT_STYLE}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </>
  )
}

