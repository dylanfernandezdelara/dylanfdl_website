'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Artifact {
  videoId: string
  url: string
}

const ARTIFACTS: Artifact[] = [
  {
    videoId: 'WlSkFFIchMw',
    url: 'https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc',
  },
  {
    videoId: 'mUGqOE6hAUA',
    url: 'https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK',
  },
  {
    videoId: '7DqunJ6kFoU',
    url: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6',
  },
  {
    videoId: '4rajIRu84Bk',
    url: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH',
  },
  {
    videoId: 'VrcXomyo1yI',
    url: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH',
  },
  {
    videoId: 'rpyJp9MEnAE',
    url: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23',
  },
]

/** Max number of cards visible beneath the top card */
const MAX_BENEATH = 3

/**
 * Alternating spiral rotations for cards beneath the top card.
 * Index 0 = first card beneath top, etc.
 */
const ROTATIONS = [-4, 3.5, -2.5]

/** Scale step-down for each card beneath the top */
const SCALE_STEP = 0.02

/** Vertical offset (px) for each card beneath the top to create a peek effect */
const Y_OFFSET_STEP = 3

/** Swipe threshold in pixels to trigger card change */
const SWIPE_THRESHOLD = 40

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export default function ArtifactCardDeck() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const dragStartX = useRef(0)
  const dragStartTime = useRef(0)
  const hasDragged = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalCards = ARTIFACTS.length

  const goNext = useCallback(() => {
    setExitDirection('left')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCards)
      setExitDirection(null)
      setDragX(0)
    }, 250)
  }, [totalCards])

  const goPrev = useCallback(() => {
    setExitDirection('right')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)
      setExitDirection(null)
      setDragX(0)
    }, 250)
  }, [totalCards])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    hasDragged.current = false
    dragStartX.current = e.clientX
    dragStartTime.current = Date.now()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStartX.current
      if (Math.abs(dx) > 3) {
        hasDragged.current = true
      }
      setDragX(dx)
    },
    [isDragging]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      setIsDragging(false)

      const dx = e.clientX - dragStartX.current
      const dt = Date.now() - dragStartTime.current
      const velocity = Math.abs(dx) / dt

      if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > 0.4) {
        if (dx < 0) {
          goNext()
        } else {
          goPrev()
        }
      } else {
        setDragX(0)
      }
    },
    [isDragging, goNext, goPrev]
  )

  const handleCardClick = useCallback(
    (url: string) => {
      if (!hasDragged.current) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    },
    []
  )

  /* Keyboard navigation */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  /** Build the visible stack: top card + up to MAX_BENEATH beneath it */
  const visibleIndices: number[] = []
  for (let i = 0; i <= MAX_BENEATH; i++) {
    visibleIndices.push((currentIndex + i) % totalCards)
  }

  return (
    <div className="mb-6 flex justify-center" ref={containerRef}>
      <div
        className="relative aspect-video w-full max-w-[min(20vw,220px)] min-w-[140px]"
        role="region"
        aria-label="Artifact videos"
        aria-roledescription="carousel"
        tabIndex={0}
      >
        {/* Render cards in reverse so top card has highest paint order */}
        {visibleIndices
          .slice()
          .reverse()
          .map((artifactIdx, reverseI) => {
            const stackPosition = MAX_BENEATH - reverseI // 0 = top, 1 = first beneath, etc.
            const isTop = stackPosition === 0
            const artifact = ARTIFACTS[artifactIdx]

            const rotation = isTop ? 0 : ROTATIONS[stackPosition - 1] ?? 0
            const scale = 1 - stackPosition * SCALE_STEP
            const yOffset = stackPosition * Y_OFFSET_STEP

            // Top card follows drag; others stay put
            const topTranslateX = isTop ? dragX : 0
            const topExitX =
              isTop && exitDirection
                ? exitDirection === 'left'
                  ? -400
                  : 400
                : 0
            const topRotation =
              isTop
                ? dragX * 0.06 + (exitDirection === 'left' ? -15 : exitDirection === 'right' ? 15 : 0)
                : rotation

            const opacity = isTop && exitDirection ? 0 : 1 - stackPosition * 0.08

            return (
              <div
                key={`${artifactIdx}-${stackPosition}`}
                className="absolute inset-0 overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
                style={{
                  zIndex: MAX_BENEATH + 1 - stackPosition,
                  transform: `translateX(${topTranslateX + topExitX}px) translateY(${yOffset}px) rotate(${topRotation}deg) scale(${scale})`,
                  opacity,
                  transition: isDragging && isTop ? 'none' : 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease',
                  cursor: isTop ? 'grab' : 'default',
                  touchAction: 'pan-y',
                  willChange: 'transform',
                }}
                onPointerDown={isTop ? handlePointerDown : undefined}
                onPointerMove={isTop ? handlePointerMove : undefined}
                onPointerUp={isTop ? handlePointerUp : undefined}
                onClick={isTop ? () => handleCardClick(artifact.url) : undefined}
                aria-label={isTop ? 'Current video — click to open or swipe to browse' : undefined}
                role={isTop ? 'button' : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbnailUrl(artifact.videoId)}
                  alt=""
                  draggable={false}
                  className="pointer-events-none h-full w-full select-none object-cover"
                />
              </div>
            )
          })}

        {/* Pagination dots */}
        <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-1">
          {ARTIFACTS.map((_, i) => (
            <span
              key={i}
              className="block h-[3px] w-[3px] rounded-full transition-colors duration-200"
              style={{
                backgroundColor: i === currentIndex ? 'var(--fg3)' : 'var(--bg3)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
