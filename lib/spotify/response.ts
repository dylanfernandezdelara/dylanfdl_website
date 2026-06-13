import type { NowPlayingCache, NowPlayingResponse } from './types'

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
