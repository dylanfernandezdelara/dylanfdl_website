import type { CachedTrack, NowPlayingResponse } from '@/lib/spotify/types'

function isCachedTrack(value: unknown): value is CachedTrack {
  if (!value || typeof value !== 'object') return false
  const track = value as Record<string, unknown>
  return (
    typeof track.id === 'string' &&
    typeof track.name === 'string' &&
    Array.isArray(track.artists) &&
    track.artists.every((artist) => typeof artist === 'string') &&
    typeof track.url === 'string'
  )
}

export function parseNowPlayingResponse(data: unknown): NowPlayingResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid now-playing response')
  }

  const payload = data as Record<string, unknown>
  const source = payload.source
  if (source !== 'cache' && source !== 'live') {
    throw new Error('Invalid now-playing source')
  }

  const track = payload.track
  if (track !== null && !isCachedTrack(track)) {
    throw new Error('Invalid now-playing track')
  }

  const isPlaying = payload.isPlaying
  if (isPlaying !== null && typeof isPlaying !== 'boolean') {
    throw new Error('Invalid now-playing playback state')
  }

  const updatedAt = payload.updatedAt
  if (updatedAt !== null && typeof updatedAt !== 'string') {
    throw new Error('Invalid now-playing timestamp')
  }

  return {
    source,
    track,
    isPlaying,
    updatedAt,
  }
}
