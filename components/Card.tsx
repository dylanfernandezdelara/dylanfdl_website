import type { ReactNode } from 'react'

import CardVideo from '@/components/CardVideo'
import { cn } from '@/lib/utils'

const cardClassName =
  'group flex flex-col overflow-hidden rounded-xl border border-bg3 bg-bg1 no-underline hover:border-fg4/25'

export type CardProps = {
  title: string
  dateLabel: string
  href: string
  external?: boolean
  videoSrc?: string
  posterSrc?: string
  thumbnail?: ReactNode
}

export default function Card({
  title,
  dateLabel,
  href,
  external = false,
  videoSrc,
  posterSrc,
  thumbnail,
}: CardProps) {
  const media = (() => {
    if (videoSrc) {
      return (
        <CardVideo
          src={videoSrc}
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )
    }
    if (posterSrc) {
      return (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )
    }
    return thumbnail ?? null
  })()

  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-4">
        <span className="text-sm font-medium leading-snug text-fg0">{title}</span>
        <span className="shrink-0 text-[0.6875rem] font-normal tabular-nums text-fg4">{dateLabel}</span>
      </div>
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-bg2">{media}</div>
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardClassName, 'text-inherit')}
      >
        {inner}
      </a>
    )
  }

  return (
    <a href={href} className={cn(cardClassName, 'text-inherit')}>
      {inner}
    </a>
  )
}
