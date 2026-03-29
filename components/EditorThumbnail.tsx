'use client'

import { useEffect, useRef, useState } from 'react'

const FULL_TEXT = 'Writing is not algorithmic, and...'
const TYPE_DELAY_MS = 230
const TYPE_DOT_DELAY_STEP_MS = 24
const DELETE_DELAY_SLOW_MS = 180
const DELETE_DELAY_FAST_MS = 58
const HOLD_FULL_MS = 900
const HOLD_EMPTY_MS = 250
const TEXT_LENGTH = FULL_TEXT.length
const TRAILING_DOT_COUNT = 3

function getTypeDelay(nextVisibleLength: number) {
  const typedCharacter = FULL_TEXT[nextVisibleLength - 1]
  const dotIndex = nextVisibleLength - (TEXT_LENGTH - TRAILING_DOT_COUNT)

  if (typedCharacter === '.' && dotIndex > 0) {
    return TYPE_DELAY_MS + dotIndex * TYPE_DOT_DELAY_STEP_MS
  }

  return TYPE_DELAY_MS
}

function getDeleteDelay(visibleLength: number) {
  const progress = visibleLength / FULL_TEXT.length
  const easedProgress = progress * progress

  return Math.round(
    DELETE_DELAY_FAST_MS + easedProgress * (DELETE_DELAY_SLOW_MS - DELETE_DELAY_FAST_MS),
  )
}

function buildTypeThresholds() {
  const thresholds: number[] = []
  let totalDelay = 0

  for (let nextVisibleLength = 1; nextVisibleLength <= TEXT_LENGTH; nextVisibleLength += 1) {
    totalDelay += getTypeDelay(nextVisibleLength)
    thresholds.push(totalDelay)
  }

  return thresholds
}

function buildDeleteThresholds() {
  const thresholds: number[] = []
  let totalDelay = 0

  for (let visibleLength = TEXT_LENGTH; visibleLength > 0; visibleLength -= 1) {
    totalDelay += getDeleteDelay(visibleLength)
    thresholds.push(totalDelay)
  }

  return thresholds
}

const TYPE_THRESHOLDS_MS = buildTypeThresholds()
const TYPE_TOTAL_MS = TYPE_THRESHOLDS_MS[TYPE_THRESHOLDS_MS.length - 1] ?? 0
const DELETE_THRESHOLDS_MS = buildDeleteThresholds()
const DELETE_TOTAL_MS = DELETE_THRESHOLDS_MS[DELETE_THRESHOLDS_MS.length - 1] ?? 0
const CYCLE_DURATION_MS = TYPE_TOTAL_MS + HOLD_FULL_MS + DELETE_TOTAL_MS + HOLD_EMPTY_MS

function getTypingLength(elapsedMs: number) {
  for (let index = 0; index < TYPE_THRESHOLDS_MS.length; index += 1) {
    if (elapsedMs < TYPE_THRESHOLDS_MS[index]) {
      return index
    }
  }

  return TEXT_LENGTH
}

function getDeletingLength(elapsedMs: number) {
  for (let index = 0; index < DELETE_THRESHOLDS_MS.length; index += 1) {
    if (elapsedMs < DELETE_THRESHOLDS_MS[index]) {
      return TEXT_LENGTH - index
    }
  }

  return 0
}

function getVisibleLengthAt(cycleElapsedMs: number) {
  if (cycleElapsedMs < TYPE_TOTAL_MS) {
    return getTypingLength(cycleElapsedMs)
  }

  if (cycleElapsedMs < TYPE_TOTAL_MS + HOLD_FULL_MS) {
    return TEXT_LENGTH
  }

  const deleteElapsedMs = cycleElapsedMs - TYPE_TOTAL_MS - HOLD_FULL_MS

  if (deleteElapsedMs < DELETE_TOTAL_MS) {
    return getDeletingLength(deleteElapsedMs)
  }

  return 0
}

export default function EditorThumbnail() {
  const [visibleLength, setVisibleLength] = useState(0)
  const cycleStartedAtRef = useRef<number | null>(null)
  const lastVisibleLengthRef = useRef(0)

  useEffect(() => {
    let animationFrameId = 0

    const tick = (timestamp: number) => {
      if (cycleStartedAtRef.current === null) {
        cycleStartedAtRef.current = timestamp
      }

      const cycleElapsedMs = (timestamp - cycleStartedAtRef.current) % CYCLE_DURATION_MS
      const nextVisibleLength = getVisibleLengthAt(cycleElapsedMs)

      if (nextVisibleLength !== lastVisibleLengthRef.current) {
        lastVisibleLengthRef.current = nextVisibleLength
        setVisibleLength(nextVisibleLength)
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg2">
      <div
        className="relative flex h-[88%] w-[92%] flex-col rounded-lg border border-bg3 bg-bg1 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--bg0),transparent_40%)]"
        aria-hidden
      >
        <div className="flex border-b border-bg3 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="ml-1.5 h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="ml-1.5 h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-1 items-center justify-center px-[8%]">
          <div className="flex max-w-full items-end overflow-hidden">
            <span className="whitespace-nowrap font-mono text-[clamp(0.7rem,1.35vw,0.95rem)] leading-[1.2] text-fg2">
              {FULL_TEXT.slice(0, visibleLength)}
            </span>
            <span className="editor-cursor-blink ml-px h-[1.05em] w-px shrink-0 bg-fg3" />
          </div>
        </div>
      </div>
    </div>
  )
}
