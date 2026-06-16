'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import {
  resolveNowPlayingTrackLayout,
  type NowPlayingTrackLayout,
  type PrefixRowMeasureElement,
} from '@/lib/nowPlaying/trackLayout'

export type UseNowPlayingTrackLayoutResult = {
  layout: NowPlayingTrackLayout
  labelMeasureRef: RefObject<HTMLSpanElement | null>
  trackMeasureRef: RefObject<HTMLSpanElement | null>
  prefixRowRootRef: RefObject<HTMLSpanElement | null>
  prefixLabelMeasureRef: RefObject<HTMLSpanElement | null>
  prefixTitleMeasureRef: RefObject<HTMLSpanElement | null>
}

export default function useNowPlayingTrackLayout(
  label: string,
  title: string,
  artist: string,
  containerRef: RefObject<HTMLElement | null>,
): UseNowPlayingTrackLayoutResult {
  const labelMeasureRef = useRef<HTMLSpanElement>(null)
  const trackMeasureRef = useRef<HTMLSpanElement>(null)
  const prefixRowRootRef = useRef<HTMLSpanElement>(null)
  const prefixLabelMeasureRef = useRef<HTMLSpanElement>(null)
  const prefixTitleMeasureRef = useRef<HTMLSpanElement>(null)
  const [layout, setLayout] = useState<NowPlayingTrackLayout>('inline')

  useLayoutEffect(() => {
    const container = containerRef.current
    const labelMeasure = labelMeasureRef.current
    const trackMeasure = trackMeasureRef.current
    const prefixRowRoot = prefixRowRootRef.current
    const prefixLabelMeasure = prefixLabelMeasureRef.current
    const prefixTitleMeasure = prefixTitleMeasureRef.current
    if (
      !container ||
      !labelMeasure ||
      !trackMeasure ||
      !prefixRowRoot ||
      !prefixLabelMeasure ||
      !prefixTitleMeasure ||
      title.length === 0 ||
      label.length === 0
    ) {
      return undefined
    }

    const prefixRowMeasure: PrefixRowMeasureElement = {
      root: prefixRowRoot,
      labelSpan: prefixLabelMeasure,
      titleSpan: prefixTitleMeasure,
    }

    const updateLayout = () => {
      const containerWidth = container.getBoundingClientRect().width
      setLayout(
        resolveNowPlayingTrackLayout({
          labelMeasure,
          trackMeasure,
          prefixRowMeasure,
          containerWidth,
          label,
          title,
          artist,
        }),
      )
    }

    updateLayout()

    const observer = new ResizeObserver(updateLayout)
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [artist, containerRef, label, title])

  return {
    layout,
    labelMeasureRef,
    trackMeasureRef,
    prefixRowRootRef,
    prefixLabelMeasureRef,
    prefixTitleMeasureRef,
  }
}
