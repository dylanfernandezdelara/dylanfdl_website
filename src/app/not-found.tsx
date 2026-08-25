import type { Metadata } from 'next'
import Link from 'next/link'
import * as stylex from '@stylexjs/stylex'

import { linkStyles } from '@/lib/linkStyles'
import { NOT_FOUND_DESCRIPTION } from '@/lib/site'

const styles = stylex.create({
  page: {
    marginInline: 'auto',
    maxWidth: '65ch',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '3rem',
    '@media (min-width: 481px)': {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    },
    '@media (min-width: 768px)': {
      paddingLeft: '2rem',
      paddingRight: '2rem',
      paddingTop: '4rem',
    },
  },
  title: {
    marginBottom: '1rem',
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: 700,
    color: 'var(--fg0)',
  },
  body: {
    marginBottom: '2rem',
    lineHeight: 1.6,
    color: 'var(--fg2)',
  },
  homeLink: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

export const metadata: Metadata = {
  title: 'Not found',
  description: NOT_FOUND_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.title)}>404</h1>
      <p {...stylex.props(styles.body)}>Page not found.</p>
      <Link href="/" {...stylex.props(styles.homeLink, linkStyles.inline)}>
        ← Back home
      </Link>
    </div>
  )
}
