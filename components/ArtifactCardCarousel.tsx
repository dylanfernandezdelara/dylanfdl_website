'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, type PanInfo, type Variants } from 'framer-motion'

interface ArtifactCard {
  videoId: string
  url: string
}

const ARTIFACTS: ArtifactCard[] = [
  { videoId: 'WlSkFFIchMw', url: 'https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc' },
  { videoId: 'mUGqOE6hAUA', url: 'https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK' },
  { videoId: '7DqunJ6kFoU', url: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6' },
  { videoId: '4rajIRu84Bk', url: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH' },
  { videoId: 'VrcXomyo1yI', url: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH' },
  { videoId: 'rpyJp9MEnAE', url: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23' },
]

function getThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Playing-card fan: cards fan out from the bottom-left origin,
 * each successive card rotated a bit more clockwise.
 */
const FAN_CONFIG = [
  { rotate: 0, x: 0, y: 0, scale: 1, opacity: 1 },
  { rotate: 5, x: 8, y: -2, scale: 0.97, opacity: 0.7 },
  { rotate: 10, x: 16, y: -6, scale: 0.94, opacity: 0.5 },
  { rotate: 15, x: 24, y: -12, scale: 0.91, opacity: 0.35 },
]

const MAX_VISIBLE = 4

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const topCardVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 200 : -200,
    rotateZ: dir > 0 ? 12 : -12,
    opacity: 0,
    scale: 0.85,
  }),
  center: {
    x: 0,
    rotateZ: 0,
    opacity: 1,
    scale: 1,
    transition: spring,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -200 : 200,
    rotateZ: dir > 0 ? -12 : 12,
    opacity: 0,
    scale: 0.85,
    transition: { ...spring, stiffness: 250 },
  }),
}

export default function ArtifactCardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const isDragging = useRef(false)

  const total = ARTIFACTS.length

  const navigate = useCallback(
    (dir: number) => {
      setDirection(dir)
      setCurrentIndex(prev => (prev + dir + total) % total)
    },
    [total],
  )

  const getCardAt = (stackPos: number) => (currentIndex + stackPos) % total

  const handleDragStart = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 40
      const velocityThreshold = 300
      if (
        Math.abs(info.offset.x) > swipeThreshold ||
        Math.abs(info.velocity.x) > velocityThreshold
      ) {
        navigate(info.offset.x > 0 ? -1 : 1)
      }
      requestAnimationFrame(() => {
        isDragging.current = false
      })
    },
    [navigate],
  )

  const handleClick = useCallback(() => {
    if (isDragging.current) return
    window.open(ARTIFACTS[currentIndex].url, '_blank', 'noopener,noreferrer')
  }, [currentIndex])

  return (
    <div className="pb-4 pt-2">
      {/* Card stack — left-aligned, playing-card fan from bottom-left */}
      <div
        className="relative"
        style={{
          width: '15vw',
          minWidth: '120px',
          maxWidth: '200px',
          aspectRatio: '4 / 3',
          perspective: '800px',
          marginRight: '40px',
        }}
      >
        {/* Background stack cards — fanned out like playing cards */}
        {Array.from(
          { length: Math.min(MAX_VISIBLE - 1, total - 1) },
          (_, i) => MAX_VISIBLE - 1 - i,
        ).map(stackPos => {
          const cardIdx = getCardAt(stackPos)
          const card = ARTIFACTS[cardIdx]
          const cfg = FAN_CONFIG[stackPos]

          return (
            <motion.div
              key={`bg-${stackPos}-${cardIdx}`}
              className="absolute inset-0 overflow-hidden rounded-lg"
              animate={{
                rotateZ: cfg.rotate,
                x: cfg.x,
                y: cfg.y,
                scale: cfg.scale,
                opacity: cfg.opacity,
              }}
              transition={spring}
              style={{
                zIndex: MAX_VISIBLE - stackPos,
                transformOrigin: 'bottom left',
                boxShadow: `0 ${2 + stackPos * 2}px ${6 + stackPos * 4}px rgba(0,0,0,0.10)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getThumbnail(card.videoId)}
                alt=""
                className="h-full w-full object-cover pointer-events-none select-none"
                draggable={false}
                loading="lazy"
              />
            </motion.div>
          )
        })}

        {/* Top card with AnimatePresence for enter/exit */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={topCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onKeyDown={e => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault()
                navigate(-1)
              } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                navigate(1)
              } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.open(ARTIFACTS[currentIndex].url, '_blank', 'noopener,noreferrer')
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Video ${currentIndex + 1} of ${total}. Press Enter to play.`}
            className="absolute inset-0 cursor-grab overflow-hidden rounded-lg outline-none
                       active:cursor-grabbing
                       focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
            style={{
              zIndex: MAX_VISIBLE + 1,
              transformOrigin: 'bottom left',
              boxShadow: '0 6px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getThumbnail(ARTIFACTS[currentIndex].videoId)}
              alt=""
              className="h-full w-full object-cover pointer-events-none select-none"
              draggable={false}
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
