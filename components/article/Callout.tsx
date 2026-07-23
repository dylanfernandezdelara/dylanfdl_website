import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type CalloutTone = 'note' | 'tip' | 'warning'

type CalloutProps = {
  children: ReactNode
  title?: string
  tone?: CalloutTone
  className?: string
}

const toneLabel: Record<CalloutTone, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
}

export default function Callout({
  children,
  title,
  tone = 'note',
  className,
}: CalloutProps) {
  return (
    <aside
      className={cn('article-callout', `article-callout--${tone}`, className)}
      data-tone={tone}
    >
      <p className="article-callout__label">{title ?? toneLabel[tone]}</p>
      <div className="article-callout__body">{children}</div>
    </aside>
  )
}
