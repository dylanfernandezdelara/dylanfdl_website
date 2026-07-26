import Link from 'next/link'
import type { ReactNode } from 'react'

import CardVideo from '@/components/CardVideo'
import { cn } from '@/lib/utils'

const cardClassName =
  'group flex flex-col overflow-hidden rounded-md border border-bg3 bg-bg1 no-underline hover:border-fg4/25'

export type CardProps = {
  title: string
  dateLabel: string
  href: string
  external?: boolean
  videoSrc?: string
  posterSrc?: string
  thumbnail?: ReactNode
  /** When false, defer attaching video sources so decode work does not contend with enter motion. */
  mediaEnabled?: boolean
}

export default function Card({
  title,
  dateLabel,
  href,
  external = false,
  videoSrc,
  posterSrc,
  thumbnail,
  mediaEnabled = true,
}: CardProps) {
  const media = (() => {
    if (videoSrc) {
      return (
        <CardVideo
          src={videoSrc}
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
          enabled={mediaEnabled}
        />
      )
    }
    if (posterSrc) {
      return (
        <img
          src={posterSrc}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )
    }
    return thumbnail ?? null
  })()

  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-3 px-4 py-3.5">
        <span className="text-sm font-normal leading-snug text-fg0">{title}</span>
        <span className="shrink-0 text-xs font-normal tabular-nums text-fg1">{dateLabel}</span>
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
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    )
  }

  return (
    <Link href={href} prefetch className={cn(cardClassName, 'text-inherit')}>
      {inner}
    </Link>
  )
}
