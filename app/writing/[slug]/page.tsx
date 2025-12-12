import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import ThemeToggle from '@/components/ThemeToggle'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import type { Metadata } from 'next'

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
      <div className="container" style={{
        paddingTop: '2rem',
        paddingBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '500',
            margin: 0,
            color: 'var(--yellow)'
          }}>
            <Link href="/about" style={{ color: 'var(--yellow)' }}>
              Dylan Fernandez de Lara
            </Link>
          </h1>
          <nav style={{
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            color: 'var(--fg3)'
          }}>
            <Link href="/about" style={{ color: 'var(--fg3)', fontWeight: '400' }}>About</Link>
            <Link href="/writing" style={{ color: 'var(--fg3)', fontWeight: '400' }}>Writing</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/projects" style={{ color: 'var(--fg3)', fontWeight: '400' }}>Projects</Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      <div className="content-wrapper" style={{
        paddingTop: '3rem',
        paddingBottom: '4rem'
      }}>
        <article>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: '1.4',
            color: 'var(--yellow)'
          }}>
            {post.title}
          </h1>

          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--gray)',
            marginBottom: '2rem'
          }}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          <div 
            style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: 'var(--fg1)'
            }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </>
  )
}

