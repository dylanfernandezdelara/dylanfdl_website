import type { NowPlayingResponse } from '@/lib/spotify/types'

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

export async function planBootstrapNowPlaying(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep[]> {
  const steps: BootstrapApplyStep[] = []

  try {
    const cached = await fetchNowPlaying(false)
    steps.push({ payload: cached, forceRoll: true })

    try {
      const live = await fetchNowPlaying(true)
      steps.push({ payload: live, forceRoll: true })
    } catch {
      // Cache display is enough when live refresh is unavailable.
    }

    return steps
  } catch {
    try {
      const live = await fetchNowPlaying(true)
      steps.push({ payload: live, forceRoll: true })
    } catch {
      // No track data available yet.
    }
    return steps
  }
}
