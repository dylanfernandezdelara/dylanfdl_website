'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const FULL_TEXT = 'I hope to clarify my own ideas and'
const TEXT_LENGTH = FULL_TEXT.length
const BASE_FONT_SIZE_PX = 15.2

const HOLD_FULL_MS = 900
const HOLD_EMPTY_MS = 250

/** Uniform float in [min, max] */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

type CycleTiming = {
  typeThresholds: number[]
  typeTotalMs: number
  deleteThresholds: number[]
  deleteTotalMs: number
  cycleDurationMs: number
}

function buildHumanTypeThresholds(): Pick<CycleTiming, 'typeThresholds' | 'typeTotalMs'> {
  const thresholds: number[] = []
  let total = 0

  for (let nextVisibleLength = 1; nextVisibleLength <= TEXT_LENGTH; nextVisibleLength += 1) {
    const char = FULL_TEXT[nextVisibleLength - 1]
    let delay = randomBetween(95, 340)

    if (char === ' ') {
      delay *= randomBetween(0.72, 0.95)
    }

    if (nextVisibleLength >= 2 && FULL_TEXT[nextVisibleLength - 2] === ' ') {
      delay += randomBetween(35, 220)
    }

    if (Math.random() < 0.07) {
      delay += randomBetween(100, 420)
    }

    delay *= randomBetween(0.88, 1.12)

    total += Math.round(delay)
    thresholds.push(total)
  }

  return { typeThresholds: thresholds, typeTotalMs: total }
}

function buildHumanDeleteThresholds(): Pick<CycleTiming, 'deleteThresholds' | 'deleteTotalMs'> {
  const thresholds: number[] = []
  let total = 0
  let burstLeft = 0

  for (let visibleLength = TEXT_LENGTH; visibleLength > 0; visibleLength -= 1) {
    const charRemoved = FULL_TEXT[visibleLength - 1]
    let delay: number

    if (burstLeft > 0) {
      burstLeft -= 1
      delay = randomBetween(24, 78)
    } else {
      const progress = visibleLength / TEXT_LENGTH
      delay =
        randomBetween(68, 175) + progress * randomBetween(25, 110) + randomBetween(-18, 38)
      if (Math.random() < 0.44) {
        burstLeft = Math.floor(randomBetween(1, 3))
      }
    }

    if (charRemoved === ' ') {
      burstLeft = 0
      delay += randomBetween(65, 240)
    }

    if (visibleLength >= 3 && FULL_TEXT[visibleLength - 2] === ' ') {
      burstLeft = 0
      delay += randomBetween(40, 130)
    }

    if (Math.random() < 0.095) {
      burstLeft = 0
      delay += randomBetween(130, 420)
    }

    delay *= randomBetween(0.8, 1.22)
    delay = Math.max(18, delay)

    total += Math.round(delay)
    thresholds.push(total)
  }

  return { deleteThresholds: thresholds, deleteTotalMs: total }
}

function rollCycleTiming(): CycleTiming {
  const typing = buildHumanTypeThresholds()
  const deleting = buildHumanDeleteThresholds()

  return {
    typeThresholds: typing.typeThresholds,
    typeTotalMs: typing.typeTotalMs,
    deleteThresholds: deleting.deleteThresholds,
    deleteTotalMs: deleting.deleteTotalMs,
    cycleDurationMs:
      typing.typeTotalMs + HOLD_FULL_MS + deleting.deleteTotalMs + HOLD_EMPTY_MS,
  }
}

function getTypingLength(elapsedMs: number, typeThresholds: number[]): number {
  for (let index = 0; index < typeThresholds.length; index += 1) {
    if (elapsedMs < typeThresholds[index]) {
      return index
    }
  }

  return TEXT_LENGTH
}

function getDeletingLength(elapsedMs: number, deleteThresholds: number[]): number {
  for (let index = 0; index < deleteThresholds.length; index += 1) {
    if (elapsedMs < deleteThresholds[index]) {
      return TEXT_LENGTH - index
    }
  }

  return 0
}

function getVisibleLengthAt(cycleElapsedMs: number, t: CycleTiming): number {
  if (cycleElapsedMs < t.typeTotalMs) {
    return getTypingLength(cycleElapsedMs, t.typeThresholds)
  }

  if (cycleElapsedMs < t.typeTotalMs + HOLD_FULL_MS) {
    return TEXT_LENGTH
  }

  const deleteElapsedMs = cycleElapsedMs - t.typeTotalMs - HOLD_FULL_MS

  if (deleteElapsedMs < t.deleteTotalMs) {
    return getDeletingLength(deleteElapsedMs, t.deleteThresholds)
  }

  return 0
}

export default function EditorThumbnail() {
  const [visibleLength, setVisibleLength] = useState(0)
  const [textSizePx, setTextSizePx] = useState(BASE_FONT_SIZE_PX)
  const cycleAnchorRef = useRef<number | null>(null)
  const timingRef = useRef<CycleTiming | null>(null)
  const lastVisibleLengthRef = useRef(0)
  const textShellRef = useRef<HTMLDivElement | null>(null)
  const textMeasureRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    timingRef.current = rollCycleTiming()

    let animationFrameId = 0

    const tick = (timestamp: number) => {
      if (cycleAnchorRef.current === null) {
        cycleAnchorRef.current = timestamp
      }

      let timing = timingRef.current
      if (!timing) {
        animationFrameId = window.requestAnimationFrame(tick)
        return
      }

      let elapsed = timestamp - cycleAnchorRef.current

      if (elapsed >= timing.cycleDurationMs) {
        timingRef.current = rollCycleTiming()
        cycleAnchorRef.current = timestamp
        timing = timingRef.current
        elapsed = 0
      }

      const nextVisibleLength = getVisibleLengthAt(elapsed, timing)

      if (nextVisibleLength !== lastVisibleLengthRef.current) {
        lastVisibleLengthRef.current = nextVisibleLength
        setVisibleLength(nextVisibleLength)
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [])

  useLayoutEffect(() => {
    const shell = textShellRef.current
    const measure = textMeasureRef.current

    if (!shell || !measure) {
      return
    }

    let animationFrameId = 0

    const updateScale = () => {
      animationFrameId = 0

      const availableWidth = shell.clientWidth
      const measureWidth = measure.getBoundingClientRect().width + 4

      if (availableWidth === 0 || measureWidth === 0) {
        return
      }

      const nextFontSize = Math.min(BASE_FONT_SIZE_PX, (availableWidth / measureWidth) * BASE_FONT_SIZE_PX)
      setTextSizePx((current) =>
        Math.abs(current - nextFontSize) < 0.1 ? current : nextFontSize,
      )
    }

    const scheduleUpdate = () => {
      if (animationFrameId === 0) {
        animationFrameId = window.requestAnimationFrame(updateScale)
      }
    }

    scheduleUpdate()

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(shell)
    resizeObserver.observe(measure)

    return () => {
      resizeObserver.disconnect()

      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
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
          <div ref={textShellRef} className="relative flex w-full justify-center overflow-hidden">
            <div className="flex items-end whitespace-nowrap">
              <span
                className="font-mono leading-[1.2] text-fg2"
                style={{ fontSize: `${textSizePx}px` }}
              >
                {FULL_TEXT.slice(0, visibleLength)}
              </span>
              <span
                className="editor-cursor-blink ml-px w-px shrink-0 bg-fg3"
                style={{ height: `${textSizePx * 1.05}px` }}
              />
            </div>
            <span
              ref={textMeasureRef}
              aria-hidden
              className="pointer-events-none absolute opacity-0 whitespace-nowrap font-mono leading-[1.2]"
              style={{ fontSize: `${BASE_FONT_SIZE_PX}px` }}
            >
              {FULL_TEXT}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
