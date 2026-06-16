import {
  computeTrackUpdate,
  type TrackRollState,
} from '@/lib/nowPlaying/applyTrackUpdate'
import { getNowPlayingLabel } from '@/lib/nowPlaying/labels'
import type { NowPlayingResponse } from '@/lib/spotify/types'

export type InitialNowPlayingState = {
  visible: boolean
  label: string
  trackUrl: string | null
  title: string
  artist: string
  rollState: TrackRollState
}

const EMPTY_STATE: InitialNowPlayingState = {
  visible: false,
  label: 'Currently listening to',
  trackUrl: null,
  title: '',
  artist: '',
  rollState: { trackId: null, hasRolled: false },
}

export function deriveInitialNowPlayingState(
  initialPayload?: NowPlayingResponse | null,
): InitialNowPlayingState {
  if (!initialPayload?.track) {
    return EMPTY_STATE
  }

  const update = computeTrackUpdate(
    initialPayload,
    EMPTY_STATE.rollState,
    { forceRoll: false },
  )
  if (!update) {
    return EMPTY_STATE
  }

  return {
    visible: true,
    label: update.label ?? getNowPlayingLabel(null),
    trackUrl: update.trackUrl,
    title: update.title,
    artist: update.artist,
    rollState: update.nextRollState,
  }
}
