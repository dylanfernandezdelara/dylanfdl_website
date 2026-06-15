import type { NowPlayingResponse } from '@/lib/spotify/types'
import { logNowPlayingWarn } from '@/lib/nowPlaying/logNowPlaying'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  forceRoll: boolean
}

export type LiveBootstrapMode = 'defer' | 'apply-immediately' | 'none'

export type ActiveLiveBootstrapMode = Exclude<LiveBootstrapMode, 'none'>

export function liveBootstrapMode(
  cacheApplied: boolean,
  hasLiveStep: boolean,
): LiveBootstrapMode {
  if (!hasLiveStep) {
    return 'none'
  }

  return activeLiveBootstrapMode(cacheApplied)
}

export function activeLiveBootstrapMode(cacheApplied: boolean): ActiveLiveBootstrapMode {
  return cacheApplied ? 'defer' : 'apply-immediately'
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

/** Returns cache then live steps in order. Used by tests; production applies cache before awaiting live. */
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
