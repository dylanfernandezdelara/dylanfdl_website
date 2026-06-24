/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useNowPlayingTrackLayout from '@/hooks/useNowPlayingTrackLayout'
import {
  formatByArtistLineWithPeriod,
  formatFullTrackLine,
  formatLabelTitleLine,
} from '@/lib/nowPlaying/trackLayout'
import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlaying/trackLayout'
import {
  attachMockPrefixRowMeasure,
  attachMockTextMeasure,
} from '@/tests/fixtures/mockTextMeasure'
import {
  NOW_PLAYING_LABEL,
  NOW_PLAYING_LAYOUT_SCENARIOS,
  labelWidthsForScenario,
  prefixRowWidthsForScenario,
  trackWidthsForScenario,
} from '@/tests/fixtures/nowPlayingLayoutScenarios'

class ResizeObserverMock {
  observe() {}

  disconnect() {}

  unobserve() {}
}

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
  withProductionMarkup?: boolean
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
  withProductionMarkup = false,
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

  const rootClassName = withProductionMarkup ? 'now-playing' : undefined
  const rootLayout = withProductionMarkup ? layout : undefined

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
      className={rootClassName}
      data-layout={rootLayout}
    >
      <span
        ref={(node) => {
          labelMeasureRef.current = node
          if (node) {
            attachMockTextMeasure(node, labelWidthsByText)
          }
        }}
        className={withProductionMarkup ? 'now-playing-measure now-playing-measure-label' : undefined}
        aria-hidden={withProductionMarkup ? true : undefined}
      />
      <span
        ref={(node) => {
          trackMeasureRef.current = node
          if (node) {
            attachMockTextMeasure(node, trackWidthsByText)
          }
        }}
        className={
          withProductionMarkup ? `now-playing-measure ${NOW_PLAYING_SLOT_CLASS}` : undefined
        }
        aria-hidden={withProductionMarkup ? true : undefined}
      />
      <span
        ref={(node) => {
          prefixRowRootRef.current = node
          if (node) {
            attachMockPrefixRowMeasure(node, prefixRowWidthsByText)
          }
        }}
        className={
          withProductionMarkup
            ? 'now-playing-measure now-playing-prefix-row-measure'
            : 'now-playing-prefix-row-measure'
        }
        aria-hidden={withProductionMarkup ? true : undefined}
      >
        <span
          ref={(node) => {
            prefixLabelMeasureRef.current = node
          }}
          className="now-playing-measure-label"
        />
        {' '}
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
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('resolves mobile-long-title-split to split with production markup and CSS', async () => {
    const scenario = NOW_PLAYING_LAYOUT_SCENARIOS.find(
      (entry) => entry.id === 'mobile-long-title-split',
    )!
    expect(scenario.expected).toBe('split')

    render(
      <LayoutProbe
        label={scenario.label}
        title={scenario.title}
        artist={scenario.artist}
        containerWidth={scenario.containerWidth}
        labelWidthsByText={labelWidthsForScenario(scenario)}
        trackWidthsByText={trackWidthsForScenario(scenario)}
        prefixRowWidthsByText={prefixRowWidthsForScenario(scenario)}
        withProductionMarkup
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('split')
    })
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
    let resizeCallback: (() => void) | null = null
    const widthRef = { current: containerWidth }

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = () => callback([], this as unknown as ResizeObserver)
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
    resizeCallback?.()

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('stacked')
    })
  })
})
