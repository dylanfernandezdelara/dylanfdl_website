import type { NowPlayingResponse } from '@/lib/spotify/types'

export type BootstrapApplyStep = {
  payload: NowPlayingResponse
  forceRoll: boolean
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
      steps.push({ payload: live, forceRoll: false })
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
