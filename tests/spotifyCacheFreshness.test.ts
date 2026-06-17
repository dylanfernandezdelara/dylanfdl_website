import { describe, expect, it } from 'vitest'

import {
  getFreshNowPlayingCache,
  getNowPlayingCacheAgeMs,
  isNowPlayingCacheFresh,
  NOW_PLAYING_CACHE_MAX_AGE_MS,
} from '@/lib/spotify/cacheFreshness'
import type { NowPlayingCache } from '@/lib/spotify/types'

const cache: NowPlayingCache = {
  track: {
    id: 'track-1',
    name: 'Symphony No. 5',
    artists: ['Gustav Mahler'],
    url: 'https://open.spotify.com/track/track-1',
  },
  updatedAt: '2026-06-13T12:00:00.000Z',
}

describe('spotify cache freshness', () => {
  it('treats cache within max age as fresh', () => {
    const now = Date.parse('2026-06-13T18:00:00.000Z')
    expect(getNowPlayingCacheAgeMs(cache, now)).toBe(6 * 60 * 60 * 1000)
    expect(isNowPlayingCacheFresh(cache, NOW_PLAYING_CACHE_MAX_AGE_MS, now)).toBe(true)
    expect(getFreshNowPlayingCache(cache, NOW_PLAYING_CACHE_MAX_AGE_MS, now)).toEqual(cache)
  })

  it('treats cache older than max age as stale', () => {
    const now = Date.parse('2026-06-15T12:00:00.000Z')
    expect(isNowPlayingCacheFresh(cache, NOW_PLAYING_CACHE_MAX_AGE_MS, now)).toBe(false)
    expect(getFreshNowPlayingCache(cache, NOW_PLAYING_CACHE_MAX_AGE_MS, now)).toBeNull()
  })

  it('treats invalid updatedAt as stale', () => {
    const invalid = { ...cache, updatedAt: 'not-a-date' }
    expect(getFreshNowPlayingCache(invalid)).toBeNull()
  })
})
