import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetNowPlayingCache } = vi.hoisted(() => ({
  mockGetNowPlayingCache: vi.fn(),
}))

vi.mock('@/lib/spotify/cache', () => ({
  getNowPlayingCache: mockGetNowPlayingCache,
}))

import { getInitialNowPlayingPayload } from '@/lib/nowPlaying/getInitialNowPlaying'

describe('getInitialNowPlayingPayload', () => {
  beforeEach(() => {
    mockGetNowPlayingCache.mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T18:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns fresh cached payload for SSR', async () => {
    mockGetNowPlayingCache.mockResolvedValue({
      track: {
        id: 'track-1',
        name: 'Instant Crush',
        artists: ['Daft Punk'],
        url: 'https://open.spotify.com/track/track-1',
      },
      updatedAt: '2026-06-13T12:00:00.000Z',
    })

    await expect(getInitialNowPlayingPayload()).resolves.toMatchObject({
      source: 'cache',
      track: { id: 'track-1', name: 'Instant Crush' },
    })
  })

  it('returns null when cached track is stale', async () => {
    mockGetNowPlayingCache.mockResolvedValue({
      track: {
        id: 'track-1',
        name: 'Symphony No. 5',
        artists: ['Gustav Mahler'],
        url: 'https://open.spotify.com/track/track-1',
      },
      updatedAt: '2026-06-01T12:00:00.000Z',
    })

    await expect(getInitialNowPlayingPayload()).resolves.toBeNull()
  })
})
