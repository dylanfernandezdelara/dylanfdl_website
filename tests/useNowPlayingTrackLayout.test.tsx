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
} from '@/lib/nowPlayingTrackLayout'
import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlayingPresentation'
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

function TrackLayoutProbe({
  label,
  title,
  artist,
  containerWidth,
  labelWidthsByText,
  trackWidthsByText,
  prefixRowWidthsByText,
}: {
  label: string
  title: string
  artist: string
  containerWidth: number
  labelWidthsByText: Record<string, number>
  trackWidthsByText: Record<string, number>
  prefixRowWidthsByText: Record<string, number>
}) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const { layout, labelMeasureRef, trackMeasureRef, prefixRowMeasureRef } =
    useNowPlayingTrackLayout(label, title, artist, containerRef)

  return (
    <span
      ref={(node) => {
        containerRef.current = node
        if (node) {
          node.getBoundingClientRect = () => mockRect(containerWidth)
        }
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
          prefixRowMeasureRef.current = node
          if (node) {
            attachMockPrefixRowMeasure(node, prefixRowWidthsByText)
          }
        }}
        className="now-playing-prefix-row-measure"
      >
        <span className="now-playing-label" />
        {' '}
        <span className={NOW_PLAYING_SLOT_CLASS} />
      </span>
      <span data-testid="layout">{layout}</span>
    </span>
  )
}

describe('useNowPlayingTrackLayout', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  it.each(NOW_PLAYING_LAYOUT_SCENARIOS)(
    'resolves $id to $expected at $viewport width',
    async (scenario) => {
      render(
        <TrackLayoutProbe
          label={scenario.label}
          title={scenario.title}
          artist={scenario.artist}
          containerWidth={scenario.containerWidth}
          labelWidthsByText={labelWidthsForScenario(scenario)}
          trackWidthsByText={trackWidthsForScenario(scenario)}
          prefixRowWidthsByText={prefixRowWidthsForScenario(scenario)}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('layout').textContent).toBe(scenario.expected)
      })
    },
  )

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
      [trackLine]: 236,
      [trackSuffix]: 248,
    }
    const prefixRowWidthsByText = {
      [formatLabelTitleLine(label, title)]: 290,
    }

    let containerWidth = 864
    let resizeCallback: (() => void) | null = null

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

    function ResizableProbe() {
      const containerRef = useRef<HTMLSpanElement>(null)
      const { layout, labelMeasureRef, trackMeasureRef, prefixRowMeasureRef } =
        useNowPlayingTrackLayout(label, title, artist, containerRef)

      return (
        <span
          ref={(node) => {
            containerRef.current = node
            if (node) {
              node.getBoundingClientRect = () => mockRect(containerWidth)
            }
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
                attachMockTextMeasure(node, trackWidthsByText, { fallbackWidth: 0 })
              }
            }}
          />
          <span
            ref={(node) => {
              prefixRowMeasureRef.current = node
              if (node) {
                attachMockPrefixRowMeasure(node, prefixRowWidthsByText)
              }
            }}
            className="now-playing-prefix-row-measure"
          >
            <span className="now-playing-label" />
            {' '}
            <span className={NOW_PLAYING_SLOT_CLASS} />
          </span>
          <span data-testid="layout">{layout}</span>
        </span>
      )
    }

    render(<ResizableProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('inline')
    })

    containerWidth = 200
    resizeCallback?.()

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('stacked')
    })
  })
})
