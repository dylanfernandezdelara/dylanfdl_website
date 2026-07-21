/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import useNowPlayingTrackLayout from '@/hooks/useNowPlayingTrackLayout'
import {
  formatByArtistLineWithPeriod,
  formatFullTrackLine,
  formatLabelTitleLine,
  NOW_PLAYING_SLOT_CLASS,
} from '@/lib/nowPlaying/trackLayout'
import {
  attachMockPrefixRowMeasure,
  attachMockTextMeasure,
} from '@/tests/fixtures/mockTextMeasure'
import { NOW_PLAYING_LABEL } from '@/tests/fixtures/nowPlayingLayoutScenarios'

function mockRect(width: number): DOMRect {
  return {
    width,
    height: 0,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: 0,
    toJSON: () => ({}),
  } as DOMRect
}

type LayoutProbeOptions = {
  label: string
  title: string
  artist: string
  containerWidth: number
  labelWidthsByText: Record<string, number>
  trackWidthsByText: Record<string, number>
  prefixRowWidthsByText: Record<string, number>
  onContainerRef?: (node: HTMLSpanElement | null) => void
}

function LayoutProbe({
  label,
  title,
  artist,
  containerWidth,
  labelWidthsByText,
  trackWidthsByText,
  prefixRowWidthsByText,
  onContainerRef,
}: LayoutProbeOptions) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const {
    layout,
    labelMeasureRef,
    trackMeasureRef,
    prefixRowRootRef,
    prefixLabelMeasureRef,
    prefixTitleMeasureRef,
  } = useNowPlayingTrackLayout(label, title, artist, containerRef)

  return (
    <span
      ref={(node) => {
        containerRef.current = node
        if (!node) return
        if (onContainerRef) {
          onContainerRef(node)
          return
        }
        node.getBoundingClientRect = () => mockRect(containerWidth)
      }}
    >
      <span
        ref={(node) => {
          labelMeasureRef.current = node
          if (node) {
            attachMockTextMeasure(node, labelWidthsByText)
          }
        }}
      />
      <span
        ref={(node) => {
          trackMeasureRef.current = node
          if (node) {
            attachMockTextMeasure(node, trackWidthsByText)
          }
        }}
      />
      <span
        ref={(node) => {
          prefixRowRootRef.current = node
          if (node) {
            attachMockPrefixRowMeasure(node, prefixRowWidthsByText)
          }
        }}
        className="now-playing-prefix-row-measure"
      >
        <span
          ref={(node) => {
            prefixLabelMeasureRef.current = node
          }}
          className="now-playing-measure-label"
        />{' '}
        <span
          ref={(node) => {
            prefixTitleMeasureRef.current = node
          }}
          className={NOW_PLAYING_SLOT_CLASS}
        />
      </span>
      <span data-testid="layout">{layout}</span>
    </span>
  )
}

describe('useNowPlayingTrackLayout', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('recomputes when resize observer callback runs with new container width', async () => {
    const label = NOW_PLAYING_LABEL
    const title = 'Instant Crush'
    const artist = 'Daft Punk'
    const labelWidthsByText = { [label]: 168 }
    const trackLine = formatFullTrackLine(title, artist)
    const trackSuffix = ` ${trackLine}.`
    const trackWidthsByText = {
      [title]: 118,
      [formatByArtistLineWithPeriod(artist)]: 112,
      [`${trackLine}.`]: 248,
      [trackLine]: 236,
      [trackSuffix]: 248,
    }
    const prefixRowWidthsByText = {
      [formatLabelTitleLine(label, title)]: 290,
    }

    const containerWidth = 864
    const resizeCallbackRef = { current: null as (() => void) | null }
    const widthRef = { current: containerWidth }

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallbackRef.current = () => callback([], this as unknown as ResizeObserver)
        }

        observe() {}

        disconnect() {}

        unobserve() {}
      },
    )

    render(
      <LayoutProbe
        label={label}
        title={title}
        artist={artist}
        containerWidth={containerWidth}
        labelWidthsByText={labelWidthsByText}
        trackWidthsByText={trackWidthsByText}
        prefixRowWidthsByText={prefixRowWidthsByText}
        onContainerRef={(node) => {
          if (node) {
            node.getBoundingClientRect = () => mockRect(widthRef.current)
          }
        }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('inline')
    })

    widthRef.current = 200
    resizeCallbackRef.current?.()

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('stacked')
    })
  })
})
