import Link from 'next/link'
import type { ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'

import ArticleToc from '@/components/article/ArticleToc'
import ProjectMeta from '@/components/article/ProjectMeta'
import type { ContentEntry } from '@/lib/content'
import { formatContentDate } from '@/lib/content'
import { PERSON_NAME } from '@/lib/site'
import { withClassName } from '@/lib/sx'

const styles = stylex.create({
  page: {
    marginInline: 'auto',
    paddingTop: '3rem',
    '@media (min-width: 768px)': {
      paddingTop: '4rem',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  brand: {
    fontFamily: 'var(--font-lora), ui-serif, Georgia, serif',
    fontWeight: 400,
    color: 'var(--fg0)',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--fg2)',
    },
  },
  nav: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '1.25rem',
    color: 'var(--fg3)',
  },
  navLink: {
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--fg0)',
    },
  },
})

type ArticleShellProps = {
  entry: ContentEntry
  children: ReactNode
}

export default function ArticleShell({ entry, children }: ArticleShellProps) {
  const kindLabel = entry.kind === 'projects' ? 'Project' : 'Note'
  const hasToc = entry.headings.length > 0

  return (
    <div
      {...withClassName(
        hasToc ? 'article-page article-page--with-toc' : 'article-page',
        stylex.props(styles.page),
      )}
    >
      <header {...withClassName('article-site-header', stylex.props(styles.header))}>
        <Link href="/" {...stylex.props(styles.brand)}>
          {PERSON_NAME}
        </Link>
        <nav aria-label="Site" {...stylex.props(styles.nav)}>
          <Link href="/" {...stylex.props(styles.navLink)}>
            Home
          </Link>
        </nav>
      </header>

      <div className="article-layout">
        <ArticleToc headings={entry.headings} />

        <article className="article-shell">
          <header className="article-shell__header">
            <p className="article-shell__kind">
              {kindLabel}
              {entry.draft ? ' · Draft' : ''}
            </p>
            <h1 className="article-shell__title">{entry.title}</h1>
            {entry.summary ? (
              <p className="article-shell__summary">{entry.summary}</p>
            ) : null}
            <p className="article-shell__date">
              {formatContentDate(entry.date)}
              {entry.updated ? ` · Updated ${formatContentDate(entry.updated)}` : ''}
            </p>
            <ProjectMeta entry={entry} />
          </header>

          <div className="article-shell__body">{children}</div>
        </article>
      </div>
    </div>
  )
}
