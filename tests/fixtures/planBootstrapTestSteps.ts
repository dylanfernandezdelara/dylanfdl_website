import type { BootstrapApplyStep } from '@/lib/nowPlaying/bootstrapNowPlaying'
import {
  fetchBootstrapCacheStep,
  fetchBootstrapLiveStep,
} from '@/lib/nowPlaying/bootstrapNowPlaying'
import type { NowPlayingResponse } from '@/lib/spotify/types'

/** Test oracle for cache-then-live bootstrap fetch order. Production defers live via resolveLiveBootstrapEffects. */
export async function planBootstrapNowPlaying(
  fetchNowPlaying: (live: boolean) => Promise<NowPlayingResponse>,
): Promise<BootstrapApplyStep[]> {
  const steps: BootstrapApplyStep[] = []

  try {
    const cacheStep = await fetchBootstrapCacheStep(fetchNowPlaying)
    steps.push(cacheStep)
    try {
      const liveStep = await fetchBootstrapLiveStep(fetchNowPlaying)
      steps.push(liveStep)
    } catch {
      // Live fetch failed after cache succeeded; production logs and keeps cache visible.
    }
    return steps
  } catch {
    // Cache fetch failed; production logs and may still attempt live-only bootstrap.
  }

  try {
    const liveStep = await fetchBootstrapLiveStep(fetchNowPlaying)
    steps.push(liveStep)
  } catch {
    // Live-only bootstrap failed.
  }

  return steps
}
