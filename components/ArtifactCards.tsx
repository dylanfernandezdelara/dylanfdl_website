'use client'

import { useState, useCallback } from 'react'

interface Artifact {
  videoId: string
  href: string
}

const ARTIFACTS: Artifact[] = [
  {
    videoId: 'WlSkFFIchMw',
    href: 'https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc',
  },
  {
    videoId: 'mUGqOE6hAUA',
    href: 'https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK',
  },
  {
    videoId: '7DqunJ6kFoU',
    href: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6',
  },
  {
    videoId: '4rajIRu84Bk',
    href: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH',
  },
  {
    videoId: 'VrcXomyo1yI',
    href: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH',
  },
  {
    videoId: 'rpyJp9MEnAE',
    href: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23',
  },
]

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export default function ArtifactCards() {
  const [order, setOrder] = useState(() => ARTIFACTS.map((_, i) => i))

  const cycle = useCallback(() => {
    setOrder((prev) => {
      const next = [...prev]
      const top = next.shift()!
      next.push(top)
      return next
    })
  }, [])

  const topArtifact = ARTIFACTS[order[0]]

  return (
    <div className="flex justify-center">
      {/* 
        Click the stack area to cycle cards.
        The top card thumbnail links to YouTube.
      */}
      <div
        className="relative w-[min(18vw,160px)] min-[481px]:w-[min(16vw,150px)] md:w-[min(14vw,140px)]"
        style={{ aspectRatio: '16 / 9' }}
      >
        {order.map((artifactIndex, stackPos) => {
          const artifact = ARTIFACTS[artifactIndex]
          const isTop = stackPos === 0
          const offset = stackPos * 5
          const zIndex = ARTIFACTS.length - stackPos

          return (
            <div
              key={artifact.videoId}
              className="absolute inset-x-0 top-0 overflow-hidden rounded-md border border-bg3 shadow-sm transition-all duration-300 ease-out"
              style={{
                zIndex,
                transform: `translateY(${offset}px)`,
                opacity: isTop ? 1 : 0.85 - stackPos * 0.1,
              }}
            >
              {isTop ? (
                <a
                  href={topArtifact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(topArtifact.href, '_blank', 'noopener,noreferrer')
                    cycle()
                  }}
                >
                  <img
                    src={getThumbnailUrl(artifact.videoId)}
                    alt=""
                    className="block w-full"
                    style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
                    draggable={false}
                  />
                </a>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={cycle}
                  role="button"
                  tabIndex={-1}
                >
                  <img
                    src={getThumbnailUrl(artifact.videoId)}
                    alt=""
                    className="block w-full"
                    style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
                    draggable={false}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
