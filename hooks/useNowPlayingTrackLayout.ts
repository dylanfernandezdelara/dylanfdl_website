'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import {
  formatCompactTrackLine,
  pickNowPlayingTrackLayout,
  type NowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'

export type UseNowPlayingTrackLayoutResult = {
  layout: NowPlayingTrackLayout
  measureRef: RefObject<HTMLSpanElement | null>
}

export default function useNowPlayingTrackLayout(
  title: string,
  artist: string,
  containerRef: RefObject<HTMLElement | null>,
): UseNowPlayingTrackLayoutResult {
  const measureRef = useRef<HTMLSpanElement>(null)
  const [layout, setLayout] = useState<NowPlayingTrackLayout>('stacked')

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure || title.length === 0) {
      return undefined
    }

    const updateLayout = () => {
      measure.textContent = formatCompactTrackLine(title, artist)
      const compactLineWidth = measure.getBoundingClientRect().width
      const containerWidth = container.getBoundingClientRect().width
      setLayout(pickNowPlayingTrackLayout(compactLineWidth, containerWidth))
    }

    updateLayout()

    const observer = new ResizeObserver(updateLayout)
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [artist, containerRef, title])

  return { layout, measureRef }
}
