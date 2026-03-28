import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPostSlugs, formatPostDate } from '@/lib/posts'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

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

const BACK_LINK_CLASSES =
  'inline-flex items-center gap-[0.4rem] text-[0.9375rem] font-semibold tracking-[0.01em] text-fg2 no-underline transition-colors duration-150 hover:text-fg1 hover:underline hover:decoration-[color:color-mix(in_oklab,var(--fg2),transparent_40%)] focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-3'

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const processedContent = await remark()
    .use(remarkHtml)
    .process(post.content)
  const contentHtml = processedContent.toString()

  const wordCount = post.content.split(/\s+/).filter(word => word.length > 0).length
  const showExcerpt = post.excerpt && wordCount > 500

  return (
    <div className="mx-auto max-w-reading px-6 pb-[4.5rem] pt-[3.25rem] md:px-8">
      <article className="grid gap-0">
        <Link
          href="/about"
          className={BACK_LINK_CLASSES}
          aria-label="Back to about"
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </Link>

        <header className="mb-0 mt-6 flex max-w-[60ch] flex-col gap-2">
          <h1 className="m-0 text-[1.875rem] font-bold leading-[1.3] tracking-[-0.01em] text-yellow">
            {post.title}
          </h1>

          <p className="text-[0.9375rem] text-fg2">
            {formatPostDate(post.date)}
            <span className="ml-[0.4rem] font-medium not-italic">— Dylan Fernandez de Lara</span>
          </p>

          {showExcerpt && (
            <p className="mt-3 text-[1.0625rem] italic leading-[1.6] text-fg2">
              {post.excerpt}
            </p>
          )}
        </header>

        <div
          className="mt-0 grid gap-5 text-[1.02rem] leading-[1.7] text-fg1"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  )
}
