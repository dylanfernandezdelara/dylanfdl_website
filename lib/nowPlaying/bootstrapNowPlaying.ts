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
}

export async function runBootstrapFetches(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
  handlers: BootstrapFetchHandlers = {},
  options: BootstrapFetchOptions = {},
): Promise<BootstrapFetchOutcome> {
  const liveResult = (await Promise.allSettled([fetchNowPlaying(true)]))[0]!
  const cacheResult = options.skipCache
    ? null
    : (await Promise.allSettled([fetchNowPlaying(false)]))[0]!

  let cacheStep: BootstrapApplyStep | null = null
  let liveStep: BootstrapApplyStep | null = null

  if (cacheResult !== null) {
    if (cacheResult.status === 'fulfilled') {
      cacheStep = { payload: cacheResult.value, forceRoll: true }
    } else {
      handlers.onCacheError?.(cacheResult.reason)
    }
  }

  if (liveResult.status === 'fulfilled') {
    liveStep = { payload: liveResult.value, forceRoll: true }
  } else {
    handlers.onLiveError?.(liveResult.reason)
  }

  return { cacheStep, liveStep }
}
