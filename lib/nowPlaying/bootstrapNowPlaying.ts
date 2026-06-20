import type { NowPlayingResponse } from '@/lib/spotify/types'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  /** Always true for cache; live defers roll when cache already displayed. */
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

type BootstrapFetchHandlers = {
  onCacheError?: (error: unknown) => void
  onLiveError?: (error: unknown) => void
}

type BootstrapFetchOptions = {
  skipCache?: boolean
  /** Called after cache fetch succeeds, before the live fetch starts. */
  onCacheStep?: (step: BootstrapApplyStep) => void
}

export async function runBootstrapFetches(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
  handlers: BootstrapFetchHandlers = {},
  options: BootstrapFetchOptions = {},
): Promise<BootstrapFetchOutcome> {
  let cacheStep: BootstrapApplyStep | null = null
  let liveStep: BootstrapApplyStep | null = null

  if (!options.skipCache) {
    try {
      cacheStep = { payload: await fetchNowPlaying(false), forceRoll: true }
      options.onCacheStep?.(cacheStep)
    } catch (error) {
      handlers.onCacheError?.(error)
    }
  }

  try {
    liveStep = { payload: await fetchNowPlaying(true), forceRoll: true }
  } catch (error) {
    handlers.onLiveError?.(error)
  }

  return { cacheStep, liveStep }
}
