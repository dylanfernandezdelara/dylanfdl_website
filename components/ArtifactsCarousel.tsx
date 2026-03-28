'use client'

import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type ArtifactVideo = {
  /** Full YouTube watch URL */
  href: string
  /** 11-character video id for thumbnail */
  videoId: string
}

const STACK_DEPTH = 4

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function YouTubeThumb({
  videoId,
  priority,
}: {
  videoId: string
  priority?: boolean
}) {
  const [useHq, setUseHq] = useState(false)
  const slug = useHq ? 'hqdefault' : 'maxresdefault'
  return (
    <Image
      src={`https://img.youtube.com/vi/${videoId}/${slug}.jpg`}
      alt=""
      fill
      className="object-cover"
      sizes="20vw"
      priority={priority}
      onError={() => setUseHq(true)}
    />
  )
}

export default function ArtifactsCarousel({ items }: { items: ArtifactVideo[] }) {
  const labelId = useId()
  const [active, setActive] = useState(0)
  const n = items.length
  const drag = useRef({
    startX: 0,
    startY: 0,
    active: false,
    pointerId: null as number | null,
    moved: false,
  })
  const blockLinkClick = useRef(false)

  const goNext = useCallback(() => {
    setActive((i) => mod(i + 1, n))
  }, [n])

  const goPrev = useCallback(() => {
    setActive((i) => mod(i - 1, n))
  }, [n])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      active: true,
      pointerId: e.pointerId,
      moved: false,
    }
    blockLinkClick.current = false
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    drag.current.active = false
    drag.current.pointerId = null
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    if (absX > 48 && absX > absY * 1.2) {
      blockLinkClick.current = true
      if (dx < 0) goNext()
      else goPrev()
    }
    drag.current.moved = false
  }

  const onPointerUp = (e: React.PointerEvent) => {
    endDrag(e)
  }

  const onPointerCancel = () => {
    drag.current.active = false
    drag.current.pointerId = null
    drag.current.moved = false
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) drag.current.moved = true
  }

  const onTopClick = (e: React.MouseEvent) => {
    if (blockLinkClick.current || drag.current.moved) {
      e.preventDefault()
      blockLinkClick.current = false
      drag.current.moved = false
    }
  }

  if (n === 0) return null

  return (
    <div
      className="artifacts-carousel mx-auto mb-6 w-[min(20vw,100%)] max-w-full"
      role="region"
      aria-labelledby={labelId}
    >
      <p id={labelId} className="sr-only">
        Video artifacts carousel. Swipe or use arrow keys to browse; activate the top card to open
        YouTube.
      </p>
      <div
        className="relative mx-auto aspect-video w-full touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerCancel}
        onPointerCancel={onPointerCancel}
      >
        {Array.from({ length: Math.min(STACK_DEPTH, n) }, (_, stackIndex) => {
          const itemIndex = mod(active + stackIndex, n)
          const item = items[itemIndex]
          const isTop = stackIndex === 0
          const depth = stackIndex
          const tilt = depth === 0 ? 0 : depth % 2 === 1 ? -5.5 : 5.5
          const y = depth * 10
          const scale = 1 - depth * 0.028
          const z = (STACK_DEPTH - depth) * 10

          return (
            <a
              key={`${stackIndex}-${item.videoId}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isTop ? 0 : -1}
              aria-hidden={!isTop}
              onClick={isTop ? onTopClick : undefined}
              className={cn(
                'absolute inset-0 block overflow-hidden rounded-[1.35rem] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none',
                isTop
                  ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue'
                  : 'pointer-events-none'
              )}
              style={{
                transform: `translateY(${y}px) rotate(${tilt}deg) scale(${scale})`,
                zIndex: z,
                opacity: 1 - depth * 0.04,
              }}
            >
              <YouTubeThumb videoId={item.videoId} priority={isTop} />
            </a>
          )
        })}
      </div>
    </div>
  )
}
