import { describe, expect, it } from 'vitest'

import type { NowPlayingCache } from '@/lib/spotify/types'

import { toLiveTrackResponse, toNowPlayingResponse } from '@/lib/spotify/response'

describe('toNowPlayingResponse', () => {
  const cache: NowPlayingCache = {
    track: {
      id: 'track-1',
      name: 'Instant Crush',
      artists: ['Daft Punk'],
      url: 'https://open.spotify.com/track/track-1',
    },
    updatedAt: '2026-06-13T12:00:00.000Z',
  }

  it('returns empty cache response when cache is missing', () => {
    expect(toNowPlayingResponse('cache', null, null)).toEqual({
      source: 'cache',
      track: null,
      isPlaying: null,
      updatedAt: null,
    })
  })

  it('maps cache payload for cache-only reads', () => {
    expect(toNowPlayingResponse('cache', cache, null)).toEqual({
      source: 'cache',
      track: cache.track,
      isPlaying: null,
      updatedAt: cache.updatedAt,
    })
  })

  it('maps live track metadata directly', () => {
    expect(toLiveTrackResponse(cache.track, true, cache.updatedAt)).toEqual({
      source: 'live',
      track: cache.track,
      isPlaying: true,
      updatedAt: cache.updatedAt,
    })
  })
})
