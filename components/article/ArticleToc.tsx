'use client'

import { useEffect, useState } from 'react'

import type { ContentHeading } from '@/lib/content'
import { cn } from '@/lib/utils'

type ArticleTocProps = {
  headings: ContentHeading[]
}

type TocListProps = {
  headings: ContentHeading[]
  activeId: string | null
  onNavigate?: () => void
}

function TocList({ headings, activeId, onNavigate }: TocListProps) {
  return (
    <ol className="article-toc__list">
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={cn(
            'article-toc__item',
            heading.level === 3 && 'article-toc__item--nested',
            activeId === heading.id && 'is-active'
          )}
        >
          <a
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? 'location' : undefined}
            onClick={onNavigate}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

export default function ArticleToc({ headings }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (headings.length === 0) {
      return
    }

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => node !== null)

    if (elements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target
        if (top instanceof HTMLElement && top.id) {
          setActiveId(top.id)
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <>
      <nav aria-label="Contents" className="article-toc article-toc--desktop">
        <p className="article-toc__label">Contents</p>
        <TocList headings={headings} activeId={activeId} />
      </nav>

      <div className="article-toc article-toc--mobile">
        <button
          type="button"
          className="article-toc__accordion"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span>Contents</span>
          <span className={cn('article-toc__chevron', open && 'is-open')} aria-hidden="true" />
        </button>
        <div className={cn('article-toc__panel', open && 'is-open')} hidden={!open}>
          <TocList
            headings={headings}
            activeId={activeId}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  )
}
