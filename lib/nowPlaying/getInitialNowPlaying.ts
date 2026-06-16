import { getNowPlayingCache } from '@/lib/spotify/cache'
import { toNowPlayingResponse } from '@/lib/spotify/response'
import type { NowPlayingResponse } from '@/lib/spotify/types'

function warnInitialPayloadUnavailable(reason: string, error?: unknown): void {
  if (process.env.NODE_ENV === 'production') return
  if (error === undefined) {
    console.warn(`[now-playing] SSR initial payload unavailable: ${reason}`)
    return
  }
  console.warn(`[now-playing] SSR initial payload unavailable: ${reason}`, error)
}

export async function getInitialNowPlayingPayload(): Promise<NowPlayingResponse | null> {
  try {
    const cached = await getNowPlayingCache()
    if (!cached?.track) {
      warnInitialPayloadUnavailable('no cached track')
      return null
    }
    return toNowPlayingResponse('cache', cached, null)
  } catch (error) {
    warnInitialPayloadUnavailable('cache read failed', error)
    return null
  }
}
