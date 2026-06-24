'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import * as editorThumbnailCycle from '@/lib/editorThumbnailCycle'
import type { EditorThumbnailCycleTiming } from '@/lib/editorThumbnailCycle'

const TEXT_LENGTH = editorThumbnailCycle.EDITOR_THUMBNAIL_FULL_TEXT.length
const BASE_FONT_SIZE_PX = 15.2

export default function EditorThumbnail() {
  const [visibleLength, setVisibleLength] = useState(TEXT_LENGTH)
  const [textSizePx, setTextSizePx] = useState(BASE_FONT_SIZE_PX)
  const { reduced: prefersReducedMotion, ready } = usePrefersReducedMotion()
  const cycleAnchorRef = useRef<number | null>(null)
  const timingRef = useRef<EditorThumbnailCycleTiming | null>(null)
  const lastVisibleLengthRef = useRef(0)
  const textShellRef = useRef<HTMLDivElement | null>(null)
  const textMeasureRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    if (!ready) {
      return
    }

    lastVisibleLengthRef.current = TEXT_LENGTH
    setVisibleLength(TEXT_LENGTH)
  }, [ready])

  useEffect(() => {
    if (!ready) {
      return undefined
    }

    if (prefersReducedMotion) {
      lastVisibleLengthRef.current = TEXT_LENGTH
      setVisibleLength(TEXT_LENGTH)
      return undefined
    }

    let animationFrameId = 0

    timingRef.current = editorThumbnailCycle.rollEditorThumbnailCycleTiming()
    cycleAnchorRef.current = null

    const tick = (timestamp: number) => {
      if (cycleAnchorRef.current === null) {
        const timing = timingRef.current
        cycleAnchorRef.current =
          timing === null ? timestamp : timestamp - (timing.typeTotalMs + editorThumbnailCycle.EDITOR_THUMBNAIL_HOLD_FULL_MS)
      }

      let activeTiming = timingRef.current
      if (!activeTiming) {
        animationFrameId = window.requestAnimationFrame(tick)
        return
      }

      let elapsed = timestamp - cycleAnchorRef.current

      if (elapsed >= activeTiming.cycleDurationMs) {
        timingRef.current = editorThumbnailCycle.rollEditorThumbnailCycleTiming()
        cycleAnchorRef.current = timestamp
        activeTiming = timingRef.current
        elapsed = 0
      }

      const nextVisibleLength = editorThumbnailCycle.getVisibleLengthAt(
        elapsed,
        activeTiming,
        TEXT_LENGTH,
      )

      if (nextVisibleLength !== lastVisibleLengthRef.current) {
        lastVisibleLengthRef.current = nextVisibleLength
        setVisibleLength(nextVisibleLength)
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [prefersReducedMotion, ready])

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
                {editorThumbnailCycle.EDITOR_THUMBNAIL_FULL_TEXT.slice(0, visibleLength)}
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
              {editorThumbnailCycle.EDITOR_THUMBNAIL_FULL_TEXT}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
