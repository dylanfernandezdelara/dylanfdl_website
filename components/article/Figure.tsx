import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type FigureWidth = 'contained' | 'wide' | 'full'

type FigureProps = {
  children: ReactNode
  caption?: string
  credit?: string
  width?: FigureWidth
  className?: string
  /** When true, animate the figure into view once (respects reduced motion). */
  reveal?: boolean
}

const widthClass: Record<FigureWidth, string> = {
  contained: 'article-figure--contained',
  wide: 'article-figure--wide',
  full: 'article-figure--full',
}

export default function Figure({
  children,
  caption,
  credit,
  width = 'wide',
  className,
  reveal = true,
}: FigureProps) {
  return (
    <figure
      className={cn(
        'article-figure',
        widthClass[width],
        reveal && 'article-figure--reveal',
        className
      )}
    >
      <div className="article-figure__media">{children}</div>
      {(caption || credit) && (
        <figcaption className="article-figure__caption">
          {caption ? <span className="article-figure__caption-text">{caption}</span> : null}
          {credit ? <span className="article-figure__credit">{credit}</span> : null}
        </figcaption>
      )}
    </figure>
  )
}
