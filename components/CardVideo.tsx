import { useEffect, useRef, useState, type RefObject } from 'react'

type CardVideoProps = {
  src: string
  poster?: string
  className?: string
}

function ignoreAutoplayBlockedError(): void {}

function useAttachAndPlayVideoWhenVisible(
  videoRef: RefObject<HTMLVideoElement | null>,
  src: string,
): boolean {
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
      video.play().catch(ignoreAutoplayBlockedError)
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
      { rootMargin: '200px 0px', threshold: 0.01 },
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
    }
  }, [src, videoRef])

  return sourceAttached
}

export default function CardVideo({ src, poster, className }: CardVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sourceAttached = useAttachAndPlayVideoWhenVisible(videoRef, src)

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
