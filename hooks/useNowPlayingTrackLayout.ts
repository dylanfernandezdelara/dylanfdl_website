'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import {
  formatByArtistLine,
  formatFullTrackLine,
  pickNowPlayingTrackLayout,
  type NowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'

export type UseNowPlayingTrackLayoutResult = {
  layout: NowPlayingTrackLayout
  measureRef: RefObject<HTMLSpanElement | null>
}

function measureLineWidth(measure: HTMLSpanElement, text: string): number {
  measure.textContent = text
  return measure.getBoundingClientRect().width
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
      const containerWidth = container.getBoundingClientRect().width
      const titleWidth = measureLineWidth(measure, title)
      const byArtistWidth = measureLineWidth(measure, formatByArtistLine(artist))
      const fullLineWidth = measureLineWidth(measure, formatFullTrackLine(title, artist))

      setLayout(
        pickNowPlayingTrackLayout({
          containerWidth,
          titleWidth,
          byArtistWidth,
          fullLineWidth,
        }),
      )
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
