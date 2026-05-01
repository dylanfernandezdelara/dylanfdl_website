'use client'

import { useEffect, useRef } from 'react'

type CardVideoProps = {
  src: string
  poster?: string
  className?: string
}

/**
 * A <video> that only loads and plays when it is visible in the viewport.
 * Keeps the About page from synchronously fetching and decoding every
 * artifact .mp4 on initial load.
 */
export default function CardVideo({ src, poster, className }: CardVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // If IntersectionObserver isn't available, fall back to eager play.
    if (typeof IntersectionObserver === 'undefined') {
      video.play().catch(() => {
        /* autoplay may be blocked; ignore */
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* autoplay may be blocked; ignore */
            })
          } else {
            video.pause()
          }
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
