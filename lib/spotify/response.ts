import type { CachedTrack, NowPlayingCache, NowPlayingResponse } from './types'

export function toNowPlayingResponse(
  source: 'cache' | 'live',
  cache: NowPlayingCache | null,
  isPlaying: boolean | null,
): NowPlayingResponse {
  return {
    source,
    track: cache?.track ?? null,
    isPlaying,
    updatedAt: cache?.updatedAt ?? null,
  }
}

export function toLiveTrackResponse(
  track: CachedTrack,
  isPlaying: boolean | null,
  updatedAt: string,
): NowPlayingResponse {
  return {
    source: 'live',
    track,
    isPlaying,
    updatedAt,
  }
}
