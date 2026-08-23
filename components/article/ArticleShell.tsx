import Link from 'next/link'
import type { ReactNode } from 'react'

import ArticleToc from '@/components/article/ArticleToc'
import ProjectMeta from '@/components/article/ProjectMeta'
import type { ContentEntry } from '@/lib/content'
import { formatContentDate } from '@/lib/content'
import { PERSON_NAME } from '@/lib/site'
import { cn } from '@/lib/utils'

type ArticleShellProps = {
  entry: ContentEntry
  children: ReactNode
}

export default function ArticleShell({ entry, children }: ArticleShellProps) {
  const kindLabel = entry.kind === 'projects' ? 'Project' : 'Note'
  const hasToc = entry.headings.length > 0

  return (
    <div
      className={cn(
        'article-page mx-auto pt-12 md:pt-16',
        hasToc && 'article-page--with-toc'
      )}
    >
      <header className="article-site-header flex items-baseline justify-between gap-4 text-sm">
        <Link
          href="/"
          className="font-serif font-normal text-fg0 transition-colors duration-150 hover:text-fg2"
        >
          {PERSON_NAME}
        </Link>
        <nav aria-label="Site" className="flex items-baseline gap-5 text-fg3">
          <Link href="/" className="transition-colors duration-150 hover:text-fg0">
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
