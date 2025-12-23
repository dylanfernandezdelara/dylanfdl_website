import Link from 'next/link'
import type { CSSProperties } from 'react'
import SectionHeading from '@/components/SectionHeading'
import { formatPostDateShort, getPostsByYear } from '@/lib/posts'

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '1rem 0 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

const ITEM_STYLE: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'baseline',
}

const DATE_STYLE: CSSProperties = {
  color: 'var(--gray)',
  fontSize: '1rem',
}

const TITLE_STYLE: CSSProperties = {
  color: 'var(--fg2)',
  fontSize: '1rem',
  fontWeight: 400,
  textDecoration: 'none',
}

export default function WritingSection() {
  const postsByYear = getPostsByYear()
  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a))

  if (years.length === 0) {
    return (
      <div style={{ marginTop: '3rem' }}>
        <SectionHeading
          marginTop="0"
          className="about-section-heading fun-artifacts-heading"
          style={{ color: 'var(--fg2)' }}
        >
          Essays
        </SectionHeading>
        <p style={{ color: 'var(--fg1)', marginTop: '0.5rem' }}>
          No essays yet. Add markdown files to <code>content/essays/</code> and they will appear here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '3rem' }}>
      {years.map((year, index) => (
        <div key={year} style={{ marginTop: index === 0 ? '0' : '2rem' }}>
          <SectionHeading
            marginTop={index === 0 ? '0' : undefined}
            className="about-section-heading fun-artifacts-heading"
            style={{ color: 'var(--fg2)' }}
          >
            {year}
          </SectionHeading>

          <ul style={LIST_STYLE}>
            {postsByYear[year].map((post) => (
              <li key={post.slug} style={ITEM_STYLE}>
                <span style={DATE_STYLE}>{formatPostDateShort(post.date)}</span>
                <Link href={`/essays/${post.slug}`} style={TITLE_STYLE}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
