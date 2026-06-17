/**
 * @vitest-environment happy-dom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('DEV', '')
})

import useNowPlaying from '@/hooks/useNowPlaying'
import type { NowPlayingResponse } from '@/lib/spotify/types'

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
    active: true,
    rollTo: direction === 'up' ? rollTitleTo : rollArtistTo,
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
    expect(rollTitleTo).toHaveBeenLastCalledWith('Instant Crush')
    // The trailing sentence period is glued onto the artist slot text so it can
    // never be stranded on its own line when a long artist name wraps.
    expect(rollArtistTo).toHaveBeenLastCalledWith('Daft Punk.')
    expect(result.current.artistSlotDisplayText).toBe('Daft Punk.')
  })

  it('uses SSR initial payload without rolling stale cache before live refresh', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      const payload = url.includes('live=1') ? livePayload : cachedPayload
      return {
        ok: true,
        json: async () => payload,
      } as Response
    })

    const { result } = renderHook(() => useNowPlaying({ initialPayload: cachedPayload }))

    expect(result.current.visible).toBe(true)
    expect(result.current.title).toBe('Instant Crush')
    expect(result.current.label).toBe('Recently listened to')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/now-playing?live=1')
    })

    expect(fetchMock).not.toHaveBeenCalledWith('/api/now-playing')
    expect(rollTitleTo).not.toHaveBeenCalled()
    expect(rollArtistTo).not.toHaveBeenCalled()
    expect(result.current.label).toBe('Currently listening to')
  })

  it('rolls once when SSR cache differs from live playback', async () => {
    const stalePayload: NowPlayingResponse = {
      ...cachedPayload,
      track: {
        id: 'stale-track',
        name: 'Symphony No. 5 in C-Sharp Minor: IV. Adagietto. Sehr langsam',
        artists: ['Gustav Mahler'],
        url: 'https://open.spotify.com/track/stale-track',
      },
    }
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (!url.includes('live=1')) {
        throw new Error('cache bootstrap should be skipped')
      }
      return {
        ok: true,
        json: async () => livePayload,
      } as Response
    })

    const { result } = renderHook(() => useNowPlaying({ initialPayload: stalePayload }))

    expect(result.current.title).toBe(
      'Symphony No. 5 in C-Sharp Minor: IV. Adagietto. Sehr langsam',
    )

    await waitFor(() => {
      expect(result.current.title).toBe('Instant Crush')
      expect(result.current.label).toBe('Currently listening to')
    })

    expect(rollTitleTo).toHaveBeenCalledTimes(1)
    expect(rollTitleTo).toHaveBeenCalledWith('Instant Crush')
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
