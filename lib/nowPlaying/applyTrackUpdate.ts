import type { NowPlayingResponse } from '@/lib/spotify/types'

export function formatNowPlayingArtists(artists: string[]): string {
  return artists.join(', ')
}

export function getNowPlayingLabel(isPlaying: boolean | null): string {
  if (isPlaying === true) {
    return 'Currently listening to'
  }
  return 'Recently listened to'
}

export type TrackRollState = {
  trackId: string | null
  hasRolled: boolean
}

export type TrackUpdate = {
  label: string | null
  trackUrl: string
  title: string
  artist: string
  shouldRoll: boolean
  nextRollState: TrackRollState
}

export function computeTrackUpdate(
  payload: NowPlayingResponse,
  rollState: TrackRollState,
  options: { forceRoll: boolean },
): TrackUpdate | null {
  if (!payload.track) {
    return null
  }

  const nextTrackId = payload.track.id
  const shouldRoll =
    options.forceRoll || !rollState.hasRolled || rollState.trackId !== nextTrackId

  return {
    label: payload.isPlaying !== null ? getNowPlayingLabel(payload.isPlaying) : null,
    trackUrl: payload.track.url,
    title: payload.track.name,
    artist: formatNowPlayingArtists(payload.track.artists),
    shouldRoll,
    nextRollState: shouldRoll
      ? { trackId: nextTrackId, hasRolled: true }
      : rollState,
  }
}
