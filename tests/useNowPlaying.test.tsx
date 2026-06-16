/**
 * @vitest-environment happy-dom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useNowPlaying from '@/hooks/useNowPlaying'
import type { NowPlayingResponse } from '@/lib/spotify/types'

vi.mock('@/hooks/isNowPlayingDevPreview', () => ({
  isNowPlayingDevPreview: () => false,
}))

const cachedPayload: NowPlayingResponse = {
  source: 'cache',
  track: {
    id: 'track-1',
    name: 'Instant Crush',
    artists: ['Daft Punk'],
    url: 'https://open.spotify.com/track/track-1',
  },
  isPlaying: null,
  updatedAt: '2026-06-13T12:00:00.000Z',
}

const livePayload: NowPlayingResponse = {
  ...cachedPayload,
  source: 'live',
  isPlaying: true,
}

const rollTitleTo = vi.fn()
const rollArtistTo = vi.fn()

vi.mock('@/hooks/useSlotTextRoll', () => ({
  default: vi.fn(({ direction }: { direction: 'up' | 'down' }) => ({
    slotRef: { current: document.createElement('span') },
    slotMounted: true,
    rollTo: direction === 'up' ? rollTitleTo : rollArtistTo,
    setInstant: vi.fn(),
  })),
}))

describe('useNowPlaying bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  it('applies cache first, defers live without re-roll, then starts polling', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      const payload = url.includes('live=1') ? livePayload : cachedPayload
      return {
        ok: true,
        json: async () => payload,
      } as Response
    })

    const { result } = renderHook(() => useNowPlaying())

    await waitFor(() => {
      expect(result.current.visible).toBe(true)
      expect(result.current.title).toBe('Instant Crush')
      expect(result.current.label).toBe('Currently listening to')
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/now-playing')
    expect(fetchMock).toHaveBeenCalledWith('/api/now-playing?live=1')
    expect(rollTitleTo).toHaveBeenCalledTimes(1)
    expect(rollArtistTo).toHaveBeenCalledTimes(1)
  })

  it('applies live immediately when cache bootstrap fails', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (!url.includes('live=1')) {
        return { ok: false, status: 500 } as Response
      }
      return {
        ok: true,
        json: async () => livePayload,
      } as Response
    })

    const { result } = renderHook(() => useNowPlaying())

    await waitFor(() => {
      expect(result.current.visible).toBe(true)
      expect(result.current.label).toBe('Currently listening to')
    })

    expect(rollTitleTo).toHaveBeenCalled()
  })
})
