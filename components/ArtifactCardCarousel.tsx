'use client'

import { useState, useCallback } from 'react'
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

/** Spiral-deck stack: alternating left/right tilt with increasing Z-depth */
const STACK_CONFIG = [
  { rotate: 0, y: 0, z: 0, scale: 1, opacity: 1 },
  { rotate: -4, y: 6, z: -30, scale: 0.95, opacity: 0.6 },
  { rotate: 3.5, y: 12, z: -60, scale: 0.90, opacity: 0.4 },
  { rotate: -2.5, y: 18, z: -90, scale: 0.85, opacity: 0.25 },
]

const MAX_VISIBLE = 4

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const topCardVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 280 : -280,
    rotateZ: dir > 0 ? 15 : -15,
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
    x: dir > 0 ? -280 : 280,
    rotateZ: dir > 0 ? -15 : 15,
    opacity: 0,
    scale: 0.85,
    transition: { ...spring, stiffness: 250 },
  }),
}

export default function ArtifactCardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const total = ARTIFACTS.length

  const navigate = useCallback(
    (dir: number) => {
      setDirection(dir)
      setCurrentIndex(prev => (prev + dir + total) % total)
    },
    [total],
  )

  const getCardAt = (stackPos: number) => (currentIndex + stackPos) % total

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 40
      const velocityThreshold = 300
      if (
        Math.abs(info.offset.x) > swipeThreshold ||
        Math.abs(info.velocity.x) > velocityThreshold
      ) {
        navigate(info.offset.x > 0 ? 1 : -1)
      }
    },
    [navigate],
  )

  return (
    <div className="flex justify-center pb-4 pt-2">
      <div className="relative flex items-center gap-3">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Previous card"
          className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                     bg-bg2 text-fg3 shadow-sm transition-colors hover:bg-bg3 hover:text-fg1
                     focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Card stack container with 3D perspective */}
        <div
          className="relative"
          style={{
            width: '20vw',
            minWidth: '150px',
            maxWidth: '260px',
            aspectRatio: '4 / 3',
            perspective: '800px',
          }}
        >
          {/* Background stack cards (rendered bottom-to-top) */}
          {Array.from(
            { length: Math.min(MAX_VISIBLE - 1, total - 1) },
            (_, i) => MAX_VISIBLE - 1 - i,
          ).map(stackPos => {
            const cardIdx = getCardAt(stackPos)
            const card = ARTIFACTS[cardIdx]
            const cfg = STACK_CONFIG[stackPos]

            return (
              <motion.div
                key={`bg-${stackPos}-${cardIdx}`}
                className="absolute inset-0 overflow-hidden rounded-xl"
                animate={{
                  rotateZ: cfg.rotate,
                  y: cfg.y,
                  z: cfg.z,
                  scale: cfg.scale,
                  opacity: cfg.opacity,
                }}
                transition={spring}
                style={{
                  zIndex: MAX_VISIBLE - stackPos,
                  transformStyle: 'preserve-3d',
                  boxShadow: `0 ${2 + stackPos * 2}px ${6 + stackPos * 4}px rgba(0,0,0,0.08)`,
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
              onDragEnd={handleDragEnd}
              onClick={() =>
                window.open(ARTIFACTS[currentIndex].url, '_blank', 'noopener,noreferrer')
              }
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
              className="absolute inset-0 cursor-grab overflow-hidden rounded-xl outline-none
                         active:cursor-grabbing
                         focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
              style={{
                zIndex: MAX_VISIBLE + 1,
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
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

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Next card"
          className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                     bg-bg2 text-fg3 shadow-sm transition-colors hover:bg-bg3 hover:text-fg1
                     focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
