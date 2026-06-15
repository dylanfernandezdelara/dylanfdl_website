import type { NowPlayingResponse } from '@/lib/spotify/types'
import { logNowPlayingWarn } from '@/lib/nowPlaying/logNowPlaying'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  forceRoll: boolean
}

export type LiveBootstrapAction =
  | { kind: 'none' }
  | { kind: 'defer'; step: BootstrapApplyStep }
  | { kind: 'apply-immediately'; step: BootstrapApplyStep }

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

export async function fetchBootstrapCacheStep(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep | null> {
  try {
    const cached = await fetchNowPlaying(false)
    return { payload: cached, forceRoll: true }
  } catch (error) {
    logNowPlayingWarn('cache bootstrap failed', error)
    return null
  }
}

export async function fetchBootstrapLiveStep(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep | null> {
  try {
    const live = await fetchNowPlaying(true)
    return { payload: live, forceRoll: true }
  } catch (error) {
    logNowPlayingWarn('live bootstrap failed', error)
    return null
  }
}

export async function planBootstrapNowPlaying(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep[]> {
  const steps: BootstrapApplyStep[] = []

  const cacheStep = await fetchBootstrapCacheStep(fetchNowPlaying)
  if (cacheStep) {
    steps.push(cacheStep)
    const liveStep = await fetchBootstrapLiveStep(fetchNowPlaying)
    if (liveStep) {
      steps.push(liveStep)
    }
    return steps
  }

  const liveStep = await fetchBootstrapLiveStep(fetchNowPlaying)
  if (liveStep) {
    steps.push(liveStep)
  }
  return steps
}
