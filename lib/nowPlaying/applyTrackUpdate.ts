import type { NowPlayingResponse } from '@/lib/spotify/types'

function formatNowPlayingArtists(artists: string[]): string {
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

export function nowPlayingHasTrack(
  trackUrl: string | null,
  title: string,
): boolean {
  return Boolean(trackUrl && title.length > 0)
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
    label:
      payload.isPlaying !== null || payload.source === 'cache'
        ? getNowPlayingLabel(payload.isPlaying)
        : null,
    trackUrl: payload.track.url,
    title: payload.track.name,
    artist: formatNowPlayingArtists(payload.track.artists),
    shouldRoll,
    nextRollState: shouldRoll
      ? { trackId: nextTrackId, hasRolled: true }
      : rollState,
  }
}

export function applyTrackUpdate(
  update: TrackUpdate,
  actions: {
    setLabel: (label: string) => void
    setTrackUrl: (url: string) => void
    setTitle: (title: string) => void
    setArtist: (artist: string) => void
    rollTitle: (title: string) => void
    rollArtist: (artist: string) => void
  },
): TrackRollState {
  if (update.label !== null) {
    actions.setLabel(update.label)
  }
  actions.setTrackUrl(update.trackUrl)
  actions.setTitle(update.title)
  actions.setArtist(update.artist)

  if (update.shouldRoll) {
    actions.rollTitle(update.title)
    actions.rollArtist(update.artist)
  }

  return update.nextRollState
}
