import { notFound } from 'next/navigation'
import { getPostBySlug, getPostSlugs } from '@/lib/posts'
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
  paddingTop: '3rem',
  paddingBottom: '4rem',
}

const ARTICLE_TITLE_STYLE: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '700',
  marginBottom: '1rem',
  lineHeight: '1.4',
  color: 'var(--yellow)',
}

const ARTICLE_DATE_STYLE: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--gray)',
  marginBottom: '2rem',
}

const ARTICLE_CONTENT_STYLE: CSSProperties = {
  fontSize: '1rem',
  lineHeight: '1.6',
  color: 'var(--fg1)',
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
        <article>
          <h1 style={ARTICLE_TITLE_STYLE}>
            {post.title}
          </h1>

          <p style={ARTICLE_DATE_STYLE}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div 
            style={ARTICLE_CONTENT_STYLE}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </>
  )
}

