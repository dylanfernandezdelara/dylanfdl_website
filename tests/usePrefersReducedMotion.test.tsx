/**
 * @vitest-environment happy-dom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

type MediaListener = (event: MediaQueryListEvent) => void

function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  let changeHandler: MediaListener | null = null

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (type: string, listener: MediaListener) => {
        if (type === 'change') {
          changeHandler = listener
        }
      },
      removeEventListener: vi.fn(),
    })),
  )

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      changeHandler?.({ matches: nextMatches } as MediaQueryListEvent)
    },
  }
}

describe('usePrefersReducedMotion', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('becomes ready after the layout read with the current preference', async () => {
    stubMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
    })
    expect(result.current.reduced).toBe(false)
  })

  it('tracks OS reduced-motion changes after ready', async () => {
    const media = stubMatchMedia(true)
    const { result } = renderHook(() => usePrefersReducedMotion())

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
    })
    expect(result.current.reduced).toBe(true)

    media.setMatches(false)

    await waitFor(() => {
      expect(result.current.reduced).toBe(false)
    })
  })
})
