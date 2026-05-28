'use client'

import { useEffect, useRef, useState } from 'react'

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
  const sourceAttachedRef = useRef(false)
  const [sourceAttached, setSourceAttached] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const attachSource = () => {
      if (sourceAttachedRef.current) return
      sourceAttachedRef.current = true
      video.src = src
      setSourceAttached(true)
      video.load()
    }

    const play = () => {
      video.play().catch(() => {
        /* autoplay may be blocked; ignore */
      })
    }

    const playWhenReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        play()
      } else {
        video.addEventListener('loadeddata', play, { once: true })
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      attachSource()
      playWhenReady()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            attachSource()
            playWhenReady()
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
  }, [src])

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      className={className}
      data-source-attached={sourceAttached ? 'true' : undefined}
    />
  )
}
