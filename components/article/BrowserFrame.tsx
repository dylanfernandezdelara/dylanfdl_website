import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type BrowserFrameProps = {
  children: ReactNode
  url?: string
  className?: string
}

export default function BrowserFrame({
  children,
  url = 'localhost:3000',
  className,
}: BrowserFrameProps) {
  return (
    <div className={cn('article-browser', className)}>
      <div className="article-browser__chrome" aria-hidden="true">
        <span className="article-browser__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="article-browser__url">{url}</span>
      </div>
      <div className="article-browser__body">{children}</div>
    </div>
  )
}
