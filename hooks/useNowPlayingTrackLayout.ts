'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import {
  resolveNowPlayingTrackLayout,
  type NowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'

export type UseNowPlayingTrackLayoutResult = {
  layout: NowPlayingTrackLayout
  labelMeasureRef: RefObject<HTMLSpanElement | null>
  trackMeasureRef: RefObject<HTMLSpanElement | null>
}

export default function useNowPlayingTrackLayout(
  label: string,
  title: string,
  artist: string,
  containerRef: RefObject<HTMLElement | null>,
): UseNowPlayingTrackLayoutResult {
  const labelMeasureRef = useRef<HTMLSpanElement>(null)
  const trackMeasureRef = useRef<HTMLSpanElement>(null)
  const [layout, setLayout] = useState<NowPlayingTrackLayout>('stacked')

  useLayoutEffect(() => {
    const container = containerRef.current
    const labelMeasure = labelMeasureRef.current
    const trackMeasure = trackMeasureRef.current
    if (!container || !labelMeasure || !trackMeasure || title.length === 0 || label.length === 0) {
      return undefined
    }

    const updateLayout = () => {
      const containerWidth = container.getBoundingClientRect().width
      setLayout(
        resolveNowPlayingTrackLayout(
          labelMeasure,
          trackMeasure,
          containerWidth,
          label,
          title,
          artist,
        ),
      )
    }

    updateLayout()

    const observer = new ResizeObserver(updateLayout)
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [artist, containerRef, label, title])

  return { layout, labelMeasureRef, trackMeasureRef }
}
