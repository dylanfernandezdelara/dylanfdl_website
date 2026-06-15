'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import {
  resolveNowPlayingTrackLayout,
  type NowPlayingTrackLayout,
  type PrefixRowMeasureElement,
} from '@/lib/nowPlayingTrackLayout'

export type UseNowPlayingTrackLayoutResult = {
  layout: NowPlayingTrackLayout
  labelMeasureRef: RefObject<HTMLSpanElement | null>
  trackMeasureRef: RefObject<HTMLSpanElement | null>
  prefixRowMeasureRef: RefObject<HTMLSpanElement | null>
}

function getPrefixRowMeasure(root: HTMLSpanElement): PrefixRowMeasureElement | null {
  const labelSpan = root.querySelector<HTMLSpanElement>('.now-playing-label')
  const titleSpan = root.querySelector<HTMLSpanElement>('.now-playing-slot')
  if (!labelSpan || !titleSpan) {
    return null
  }

  return {
    root,
    labelSpan,
    titleSpan,
  }
}

export default function useNowPlayingTrackLayout(
  label: string,
  title: string,
  artist: string,
  containerRef: RefObject<HTMLElement | null>,
): UseNowPlayingTrackLayoutResult {
  const labelMeasureRef = useRef<HTMLSpanElement>(null)
  const trackMeasureRef = useRef<HTMLSpanElement>(null)
  const prefixRowMeasureRef = useRef<HTMLSpanElement>(null)
  const [layout, setLayout] = useState<NowPlayingTrackLayout>('stacked')

  useLayoutEffect(() => {
    const container = containerRef.current
    const labelMeasure = labelMeasureRef.current
    const trackMeasure = trackMeasureRef.current
    const prefixRowRoot = prefixRowMeasureRef.current
    const prefixRowMeasure = prefixRowRoot ? getPrefixRowMeasure(prefixRowRoot) : null
    if (
      !container ||
      !labelMeasure ||
      !trackMeasure ||
      !prefixRowMeasure ||
      title.length === 0 ||
      label.length === 0
    ) {
      return undefined
    }

    const updateLayout = () => {
      const containerWidth = container.getBoundingClientRect().width
      setLayout(
        resolveNowPlayingTrackLayout(
          labelMeasure,
          trackMeasure,
          prefixRowMeasure,
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

  return { layout, labelMeasureRef, trackMeasureRef, prefixRowMeasureRef }
}
