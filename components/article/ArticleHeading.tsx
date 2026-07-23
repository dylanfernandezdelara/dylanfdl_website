import type { ReactNode } from 'react'

import HeadingAnchorLink from '@/components/article/HeadingAnchorLink'
import { cn } from '@/lib/utils'

type HeadingTag = 'h2' | 'h3' | 'h4'

type ArticleHeadingProps = {
  as: HeadingTag
  id?: string
  children?: ReactNode
  className?: string
}

function textFromChildren(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(textFromChildren).join('')
  }
  return ''
}

export default function ArticleHeading({
  as: Tag,
  id,
  children,
  className,
}: ArticleHeadingProps) {
  return (
    <Tag id={id} className={cn('article-heading', `article-heading--${Tag}`, className)}>
      <span className="article-heading__text">{children}</span>
      {id ? (
        <HeadingAnchorLink id={id} label={textFromChildren(children)} />
      ) : null}
    </Tag>
  )
}
