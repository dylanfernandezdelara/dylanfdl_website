import type { NowPlayingResponse } from '@/lib/spotify/types'
import { toLogErrorMessage } from '@/lib/sanitizeLogError'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  forceRoll: boolean
}

export type LiveBootstrapMode = 'defer' | 'apply-immediately' | 'none'

export function liveBootstrapMode(
  cacheApplied: boolean,
  hasLiveStep: boolean,
): LiveBootstrapMode {
  if (!hasLiveStep) {
    return 'none'
  }

  return cacheApplied ? 'defer' : 'apply-immediately'
}

export async function fetchBootstrapCacheStep(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep | null> {
  try {
    const cached = await fetchNowPlaying(false)
    return { payload: cached, forceRoll: true }
  } catch (error) {
    console.warn('[now-playing] cache bootstrap failed:', toLogErrorMessage(error))
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
    console.warn('[now-playing] live bootstrap failed:', toLogErrorMessage(error))
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
