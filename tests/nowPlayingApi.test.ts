import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NowPlayingCache } from '@/lib/spotify/types'
import * as logNowPlaying from '@/lib/nowPlaying/logNowPlaying'

const cache: NowPlayingCache = {
  track: {
    id: 'track-1',
    name: 'Instant Crush',
    artists: ['Daft Punk'],
    url: 'https://open.spotify.com/track/track-1',
  },
  updatedAt: '2026-06-13T12:00:00.000Z',
  isPlaying: true,
}

const {
  mockGetNowPlayingCache,
  mockShouldSkipLiveRefresh,
  mockMarkLiveRefresh,
  mockSetNowPlayingCache,
  mockGetCachedAccessToken,
  mockSetCachedAccessToken,
  mockRefreshSpotifyAccessToken,
  mockFetchCurrentlyPlaying,
  mockIsSameOriginRequest,
} = vi.hoisted(() => ({
  mockGetNowPlayingCache: vi.fn(),
  mockShouldSkipLiveRefresh: vi.fn(),
  mockMarkLiveRefresh: vi.fn(),
  mockSetNowPlayingCache: vi.fn(),
  mockGetCachedAccessToken: vi.fn(),
  mockSetCachedAccessToken: vi.fn(),
  mockRefreshSpotifyAccessToken: vi.fn(),
  mockFetchCurrentlyPlaying: vi.fn(),
  mockIsSameOriginRequest: vi.fn(),
}))

vi.mock('@/lib/spotify/cache', () => ({
  getNowPlayingCache: mockGetNowPlayingCache,
  shouldSkipLiveRefresh: mockShouldSkipLiveRefresh,
  markLiveRefresh: mockMarkLiveRefresh,
  setNowPlayingCache: mockSetNowPlayingCache,
  getCachedAccessToken: mockGetCachedAccessToken,
  setCachedAccessToken: mockSetCachedAccessToken,
}))

vi.mock('@/lib/spotify/auth', () => ({
  refreshSpotifyAccessToken: mockRefreshSpotifyAccessToken,
}))

vi.mock('@/lib/spotify/currentlyPlaying', () => ({
  fetchCurrentlyPlaying: mockFetchCurrentlyPlaying,
  toNowPlayingCache: (track: NowPlayingCache['track'], isPlaying: boolean | null = null) => ({
    track,
    updatedAt: cache.updatedAt,
    isPlaying,
  }),
}))

vi.mock('@/lib/api/origin', () => ({
  isSameOriginRequest: mockIsSameOriginRequest,
}))

function makeRequest(query: Record<string, string | undefined> = {}): Request {
  const url = new URL('https://www.dylanfdl.com/api/now-playing')
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, value)
    }
  }
  return new Request(url, { headers: {} })
}

describe('handleNowPlayingRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(logNowPlaying, 'logNowPlayingWarn').mockImplementation(() => undefined)
    vi.spyOn(logNowPlaying, 'logNowPlayingError').mockImplementation(() => undefined)
    mockGetNowPlayingCache.mockResolvedValue(cache)
    mockShouldSkipLiveRefresh.mockResolvedValue(false)
    mockGetCachedAccessToken.mockResolvedValue('cached-token')
    mockIsSameOriginRequest.mockReturnValue(true)
    mockSetNowPlayingCache.mockResolvedValue(undefined)
    mockMarkLiveRefresh.mockResolvedValue(undefined)
  })

  it('returns cached payload for canonical requests', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    const response = await handleNowPlayingRequest(makeRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      source: 'cache',
      track: cache.track,
    })
  })

  it('rejects cross-origin live refresh requests', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    mockIsSameOriginRequest.mockReturnValue(false)

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(response.status).toBe(403)
  })

  it('logs and falls back to cache when live refresh fails', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    const liveError = new Error('spotify unavailable')
    mockFetchCurrentlyPlaying.mockRejectedValue(liveError)

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(logNowPlaying.logNowPlayingWarn).toHaveBeenCalledWith('live refresh failed', liveError)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      source: 'cache',
      track: cache.track,
      isPlaying: true,
    })
  })

  it('logs and returns an empty fallback when the outer handler fails', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    const outerError = new Error('redis unavailable')
    mockGetNowPlayingCache.mockRejectedValue(outerError)

    const response = await handleNowPlayingRequest(makeRequest())

    expect(logNowPlaying.logNowPlayingError).toHaveBeenCalledWith('request failed', outerError)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      source: 'cache',
      track: null,
    })
  })

  it('returns a live track response when refresh succeeds', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: cache.track,
      isPlaying: true,
    })

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(mockSetNowPlayingCache).toHaveBeenCalled()
    expect(mockMarkLiveRefresh).toHaveBeenCalled()
    expect(mockSetNowPlayingCache.mock.invocationCallOrder[0]).toBeLessThan(
      mockMarkLiveRefresh.mock.invocationCallOrder[0]!,
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      source: 'live',
      track: cache.track,
      isPlaying: true,
    })
  })

  it('does not mark live refresh when cache write fails', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    const cacheError = new Error('cache write failed')
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: cache.track,
      isPlaying: true,
    })
    mockSetNowPlayingCache.mockRejectedValue(cacheError)

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(mockMarkLiveRefresh).not.toHaveBeenCalled()
    expect(logNowPlaying.logNowPlayingWarn).toHaveBeenCalledWith('live refresh failed', cacheError)
    await expect(response.json()).resolves.toMatchObject({
      source: 'cache',
      track: cache.track,
    })
  })

  it('returns cached playback when live refresh is debounced', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    mockShouldSkipLiveRefresh.mockResolvedValue(true)

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(mockFetchCurrentlyPlaying).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      source: 'live',
      track: cache.track,
      isPlaying: true,
    })
  })

  it('returns live playback state without a track when Spotify has nothing playing', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: null,
      isPlaying: false,
    })

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(mockSetNowPlayingCache).toHaveBeenCalledWith(
      expect.objectContaining({
        track: cache.track,
        isPlaying: false,
      }),
    )
    expect(mockMarkLiveRefresh).toHaveBeenCalled()
    expect(mockSetNowPlayingCache.mock.invocationCallOrder[0]).toBeLessThan(
      mockMarkLiveRefresh.mock.invocationCallOrder[0]!,
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      source: 'live',
      track: cache.track,
      isPlaying: false,
    })
  })

  it('does not mark live refresh when no-track cache write fails', async () => {
    const { handleNowPlayingRequest } = await import('@/lib/nowPlaying/handleNowPlayingRequest')
    const cacheError = new Error('cache write failed')
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: null,
      isPlaying: false,
    })
    mockSetNowPlayingCache.mockRejectedValue(cacheError)

    const response = await handleNowPlayingRequest(makeRequest({ live: '1' }))

    expect(mockMarkLiveRefresh).not.toHaveBeenCalled()
    expect(logNowPlaying.logNowPlayingWarn).toHaveBeenCalledWith('live refresh failed', cacheError)
    await expect(response.json()).resolves.toMatchObject({
      source: 'cache',
      track: cache.track,
    })
  })
})
