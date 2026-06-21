import {
  computeTrackUpdate,
  getNowPlayingLabel,
  nowPlayingHasTrack,
  type TrackRollState,
} from '@/lib/nowPlaying/applyTrackUpdate'
import type { NowPlayingResponse } from '@/lib/spotify/types'

export type InitialNowPlayingState = {
  label: string
  trackUrl: string | null
  title: string
  artist: string
  rollState: TrackRollState
}

const INTRO_STATE: InitialNowPlayingState = {
  label: getNowPlayingLabel(null),
  trackUrl: null,
  title: '',
  artist: '',
  rollState: { trackId: null, hasRolled: false },
}

export function initialStateHasTrack(state: InitialNowPlayingState): boolean {
  return nowPlayingHasTrack(state.trackUrl, state.title)
}

export function deriveInitialNowPlayingState(
  initialPayload?: NowPlayingResponse | null,
): InitialNowPlayingState {
  if (!initialPayload?.track) {
    return INTRO_STATE
  }

  const update = computeTrackUpdate(
    initialPayload,
    INTRO_STATE.rollState,
    { forceRoll: false },
  )
  if (!update) {
    return INTRO_STATE
  }

  return {
    label: update.label ?? getNowPlayingLabel(null),
    trackUrl: update.trackUrl,
    title: update.title,
    artist: update.artist,
    rollState: update.nextRollState,
  }
}
