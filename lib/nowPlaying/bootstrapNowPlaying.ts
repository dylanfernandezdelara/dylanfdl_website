import type { NowPlayingResponse } from '@/lib/spotify/types'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  forceRoll: boolean
}

export type LiveBootstrapEffects =
  | { kind: 'defer-live'; payload: NowPlayingResponse }
  | { kind: 'apply-live-immediately'; payload: NowPlayingResponse; forceRoll: boolean }
  | { kind: 'schedule-poll' }

export type BootstrapFetchOutcome = {
  cacheStep: BootstrapApplyStep | null
  liveStep: BootstrapApplyStep | null
}

export function resolveLiveBootstrapEffects(
  cacheApplied: boolean,
  liveStep: BootstrapApplyStep | null,
): LiveBootstrapEffects {
  if (!liveStep) {
    return { kind: 'schedule-poll' }
  }

  if (cacheApplied) {
    return { kind: 'defer-live', payload: liveStep.payload }
  }

  return {
    kind: 'apply-live-immediately',
    payload: liveStep.payload,
    forceRoll: liveStep.forceRoll,
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

type BootstrapFetchHandlers = {
  onCacheError?: (error: unknown) => void
  onLiveError?: (error: unknown) => void
}

export async function runBootstrapFetches(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
  handlers: BootstrapFetchHandlers = {},
): Promise<BootstrapFetchOutcome> {
  let cacheStep: BootstrapApplyStep | null = null
  let liveStep: BootstrapApplyStep | null = null

  try {
    cacheStep = await fetchBootstrapCacheStep(fetchNowPlaying)
  } catch (error) {
    handlers.onCacheError?.(error)
  }

  try {
    liveStep = await fetchBootstrapLiveStep(fetchNowPlaying)
  } catch (error) {
    handlers.onLiveError?.(error)
  }

  return { cacheStep, liveStep }
}
