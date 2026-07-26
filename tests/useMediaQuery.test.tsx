/**
 * @vitest-environment happy-dom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useMediaQuery from '../hooks/useMediaQuery'

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

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the query on mount and tracks changes', async () => {
    const media = stubMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))

    await waitFor(() => {
      expect(result.current).toBe(true)
    })

    media.setMatches(false)

    await waitFor(() => {
      expect(result.current).toBe(false)
    })
  })
})
