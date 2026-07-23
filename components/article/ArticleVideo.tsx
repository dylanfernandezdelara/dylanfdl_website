'use client'

import { useEffect, useRef, useState } from 'react'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type ArticleVideoProps = {
  src: string
  poster?: string
  alt?: string
  className?: string
  loop?: boolean
  muted?: boolean
}

export default function ArticleVideo({
  src,
  poster,
  alt = '',
  className,
  loop = true,
  muted = true,
}: ArticleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)
  const { reduced, ready } = usePrefersReducedMotion()

  useEffect(() => {
    const node = videoRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(Boolean(entry?.isIntersecting))
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const node = videoRef.current
    if (!node || !ready) {
      return
    }

    if (reduced || paused || !visible) {
      node.pause()
      return
    }

    void node.play().catch(() => {
      // Autoplay blocked — expose native controls via paused state.
      setPaused(true)
    })
  }, [paused, ready, reduced, visible])

  return (
    <div className={cn('article-video', className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={alt || undefined}
        className="article-video__el"
        playsInline
        muted={muted}
        loop={loop}
        preload="metadata"
        controls={reduced || paused}
      />
      {!reduced && (
        <button
          type="button"
          className="article-video__toggle"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      )}
    </div>
  )
}
