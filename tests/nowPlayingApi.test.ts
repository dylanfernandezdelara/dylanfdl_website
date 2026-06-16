import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiRequest, ApiResponse } from '@/lib/api/vercel'
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

vi.mock('../lib/spotify/cache.js', () => ({
  getNowPlayingCache: mockGetNowPlayingCache,
  shouldSkipLiveRefresh: mockShouldSkipLiveRefresh,
  markLiveRefresh: mockMarkLiveRefresh,
  setNowPlayingCache: mockSetNowPlayingCache,
  getCachedAccessToken: mockGetCachedAccessToken,
  setCachedAccessToken: mockSetCachedAccessToken,
}))

vi.mock('../lib/spotify/auth.js', () => ({
  refreshSpotifyAccessToken: mockRefreshSpotifyAccessToken,
}))

vi.mock('../lib/spotify/currentlyPlaying.js', () => ({
  fetchCurrentlyPlaying: mockFetchCurrentlyPlaying,
  toNowPlayingCache: (track: NowPlayingCache['track']) => ({
    track,
    updatedAt: cache.updatedAt,
  }),
}))

vi.mock('../lib/api/origin.js', () => ({
  isSameOriginRequest: mockIsSameOriginRequest,
}))

function makeRequest(
  options: {
    method?: string
    query?: Record<string, string | undefined>
  } = {},
): ApiRequest {
  return {
    method: options.method ?? 'GET',
    query: options.query ?? {},
    headers: {},
  } as ApiRequest
}

function makeResponse(): ApiResponse & { statusCode?: number; body?: unknown } {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(statusCode: number) {
      response.statusCode = statusCode
      return response
    },
    json(body: unknown) {
      response.body = body
      return response
    },
    send() {
      return response
    },
    redirect() {
      return response
    },
  }

  return response as ApiResponse & { statusCode?: number; body?: unknown }
}

describe('api/now-playing handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(logNowPlaying, 'logNowPlayingWarn').mockImplementation(() => undefined)
    vi.spyOn(logNowPlaying, 'logNowPlayingError').mockImplementation(() => undefined)
    mockGetNowPlayingCache.mockResolvedValue(cache)
    mockShouldSkipLiveRefresh.mockResolvedValue(false)
    mockGetCachedAccessToken.mockResolvedValue('cached-token')
    mockIsSameOriginRequest.mockReturnValue(true)
  })

  it('returns cached payload for canonical requests', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()

    await handler(makeRequest(), res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'cache',
      track: cache.track,
    })
  })

  it('rejects non-GET requests', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()

    await handler(makeRequest({ method: 'POST' }), res)

    expect(res.statusCode).toBe(405)
  })

  it('rejects cross-origin live refresh requests', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    mockIsSameOriginRequest.mockReturnValue(false)

    await handler(makeRequest({ query: { live: '1' } }), res)

    expect(res.statusCode).toBe(403)
  })

  it('logs and falls back to cache when live refresh fails', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    const liveError = new Error('spotify unavailable')
    mockFetchCurrentlyPlaying.mockRejectedValue(liveError)

    await handler(makeRequest({ query: { live: '1' } }), res)

    expect(logNowPlaying.logNowPlayingWarn).toHaveBeenCalledWith('live refresh failed', liveError)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'cache',
      track: cache.track,
    })
  })

  it('logs and returns an empty fallback when the outer handler fails', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    const outerError = new Error('redis unavailable')
    mockGetNowPlayingCache.mockRejectedValue(outerError)

    await handler(makeRequest(), res)

    expect(logNowPlaying.logNowPlayingError).toHaveBeenCalledWith('request failed', outerError)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'cache',
      track: null,
    })
  })

  it('returns a live track response when refresh succeeds', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: cache.track,
      isPlaying: true,
    })

    await handler(makeRequest({ query: { live: '1' } }), res)

    expect(mockSetNowPlayingCache).toHaveBeenCalled()
    expect(mockMarkLiveRefresh).toHaveBeenCalled()
    expect(mockSetNowPlayingCache.mock.invocationCallOrder[0]).toBeLessThan(
      mockMarkLiveRefresh.mock.invocationCallOrder[0]!,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'live',
      track: cache.track,
      isPlaying: true,
    })
  })

  it('does not mark live refresh when cache write fails', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    const cacheError = new Error('cache write failed')
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: cache.track,
      isPlaying: true,
    })
    mockSetNowPlayingCache.mockRejectedValue(cacheError)

    await handler(makeRequest({ query: { live: '1' } }), res)

    expect(mockMarkLiveRefresh).not.toHaveBeenCalled()
    expect(logNowPlaying.logNowPlayingWarn).toHaveBeenCalledWith('live refresh failed', cacheError)
    expect(res.body).toMatchObject({
      source: 'cache',
      track: cache.track,
    })
  })

  it('returns cached playback when live refresh is debounced', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    mockShouldSkipLiveRefresh.mockResolvedValue(true)

    await handler(makeRequest({ query: { live: '1' } }), res)

    expect(mockFetchCurrentlyPlaying).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'live',
      track: cache.track,
    })
  })

  it('returns live playback state without a track when Spotify has nothing playing', async () => {
    const { default: handler } = await import('../api/now-playing')
    const res = makeResponse()
    mockFetchCurrentlyPlaying.mockResolvedValue({
      track: null,
      isPlaying: false,
    })

    await handler(makeRequest({ query: { live: '1' } }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'live',
      track: cache.track,
      isPlaying: false,
    })
  })
})
