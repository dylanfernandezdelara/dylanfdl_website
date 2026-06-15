/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import useNowPlayingTrackLayout from '@/hooks/useNowPlayingTrackLayout'
import { formatByArtistLine, formatFullNowPlayingLine, formatFullTrackLine } from '@/lib/nowPlayingTrackLayout'
import {
  NOW_PLAYING_LABEL,
  NOW_PLAYING_LAYOUT_SCENARIOS,
  widthsForScenario,
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
  widthsByText,
}: {
  label: string
  title: string
  artist: string
  containerWidth: number
  widthsByText: Record<string, number>
}) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const { layout, measureRef } = useNowPlayingTrackLayout(label, title, artist, containerRef)

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
          measureRef.current = node
          if (node) {
            node.getBoundingClientRect = function getBoundingClientRect(this: HTMLSpanElement) {
              const text = this.textContent ?? ''
              const width = widthsByText[text]
              if (width === undefined) {
                throw new Error(`Missing mocked width for text: ${text}`)
              }
              return mockRect(width)
            }
          }
        }}
      />
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
          widthsByText={widthsForScenario(scenario)}
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
    const widthsByText = {
      [label]: 168,
      [title]: 118,
      [formatByArtistLine(artist)]: 108,
      [formatFullTrackLine(title, artist)]: 236,
      [formatFullNowPlayingLine(label, title, artist)]: 416,
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
      const { layout, measureRef } = useNowPlayingTrackLayout(label, title, artist, containerRef)

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
              measureRef.current = node
              if (node) {
                node.getBoundingClientRect = function getBoundingClientRect(this: HTMLSpanElement) {
                  const text = this.textContent ?? ''
                  return mockRect(widthsByText[text as keyof typeof widthsByText] ?? 0)
                }
              }
            }}
          />
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
