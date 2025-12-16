import Link from 'next/link'
import { getPostsByYear } from '@/lib/posts'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
  title: 'Essays',
}

const CONTENT_WRAPPER_STYLE: CSSProperties = {
  paddingTop: '3rem',
  paddingBottom: '4rem',
}

const POSTS_CONTAINER_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
}

const YEAR_HEADING_STYLE: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '700',
  marginBottom: '1.5rem',
  color: 'var(--gray)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

const POSTS_LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
}

const POST_LINK_STYLE: CSSProperties = {
  display: 'block',
}

const POST_TITLE_STYLE: CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: '700',
  marginBottom: '0.5rem',
  lineHeight: '1.5',
  color: 'var(--blue)',
}

const POST_DATE_STYLE: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--gray)',
  marginBottom: '0.5rem',
}

const POST_EXCERPT_STYLE: CSSProperties = {
  fontSize: '0.9375rem',
  color: 'var(--fg2)',
  lineHeight: '1.6',
  marginTop: '0.5rem',
}

const EMPTY_STATE_STYLE: CSSProperties = {
  color: 'var(--gray)',
  fontSize: '0.9375rem',
  lineHeight: '1.6',
}

const CODE_STYLE: CSSProperties = {
  color: 'var(--purple)',
  backgroundColor: 'var(--bg1)',
  padding: '0.2em 0.4em',
  border: '1px solid var(--bg2)',
}

export default function Essays() {
  const postsByYear = getPostsByYear()

  return (
    <>
      <div className="content-wrapper" style={CONTENT_WRAPPER_STYLE}>
        <div style={POSTS_CONTAINER_STYLE}>
          {Object.keys(postsByYear)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((year) => (
              <div key={year}>
                <h2 style={YEAR_HEADING_STYLE}>
                  {year}
                </h2>
                <div style={POSTS_LIST_STYLE}>
                  {postsByYear[year].map((post) => (
                    <div key={post.slug}>
                      <Link href={`/essays/${post.slug}`} style={POST_LINK_STYLE}>
                        <h3 style={POST_TITLE_STYLE}>
                          {post.title}
                        </h3>
                      </Link>
                      <p style={POST_DATE_STYLE}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {post.excerpt && (
                        <p style={POST_EXCERPT_STYLE}>
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {Object.keys(postsByYear).length === 0 && (
          <p style={EMPTY_STATE_STYLE}>
            No essays yet. Create markdown files in <code style={CODE_STYLE}>content/essays/</code> to add your essays.
          </p>
        )}
      </div>
    </>
  )
}

