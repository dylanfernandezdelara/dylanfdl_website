import type { NowPlayingResponse } from '@/lib/spotify/types'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  forceRoll: boolean
}

export type LiveBootstrapAction =
  | { kind: 'none' }
  | { kind: 'defer'; step: BootstrapApplyStep }
  | { kind: 'apply-immediately'; step: BootstrapApplyStep }

export type LiveBootstrapEffects =
  | { kind: 'defer-live'; payload: NowPlayingResponse }
  | { kind: 'apply-live-immediately'; payload: NowPlayingResponse; forceRoll: boolean }
  | { kind: 'schedule-poll' }

export function planLiveBootstrapAction(
  cacheApplied: boolean,
  liveStep: BootstrapApplyStep | null,
): LiveBootstrapAction {
  if (!liveStep) {
    return { kind: 'none' }
  }

  if (cacheApplied) {
    return { kind: 'defer', step: liveStep }
  }

  return { kind: 'apply-immediately', step: liveStep }
}

export function resolveLiveBootstrapEffects(
  cacheApplied: boolean,
  liveStep: BootstrapApplyStep | null,
): LiveBootstrapEffects {
  const action = planLiveBootstrapAction(cacheApplied, liveStep)

  switch (action.kind) {
    case 'defer':
      return { kind: 'defer-live', payload: action.step.payload }
    case 'apply-immediately':
      return {
        kind: 'apply-live-immediately',
        payload: action.step.payload,
        forceRoll: action.step.forceRoll,
      }
    case 'none':
      return { kind: 'schedule-poll' }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

export async function fetchBootstrapCacheStep(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep> {
  const cached = await fetchNowPlaying(false)
  return { payload: cached, forceRoll: true }
}

export async function fetchBootstrapLiveStep(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep> {
  const live = await fetchNowPlaying(true)
  return { payload: live, forceRoll: true }
}
