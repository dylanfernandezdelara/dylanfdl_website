import type { NowPlayingCache } from './types'

/** Max age before cached playback is treated as too stale to show instantly. */
export const NOW_PLAYING_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000

export function getNowPlayingCacheAgeMs(cache: NowPlayingCache, now = Date.now()): number {
  const updatedAt = Date.parse(cache.updatedAt)
  if (Number.isNaN(updatedAt)) {
    return Number.POSITIVE_INFINITY
  }
  return Math.max(0, now - updatedAt)
}

export function isNowPlayingCacheFresh(
  cache: NowPlayingCache,
  maxAgeMs = NOW_PLAYING_CACHE_MAX_AGE_MS,
  now = Date.now(),
): boolean {
  return getNowPlayingCacheAgeMs(cache, now) <= maxAgeMs
}

export function getFreshNowPlayingCache(
  cache: NowPlayingCache | null,
  maxAgeMs = NOW_PLAYING_CACHE_MAX_AGE_MS,
  now = Date.now(),
): NowPlayingCache | null {
  if (!cache) return null
  return isNowPlayingCacheFresh(cache, maxAgeMs, now) ? cache : null
}
