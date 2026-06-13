import { refreshSpotifyAccessToken } from '../lib/spotify/auth.js'
import {
  getCachedAccessToken,
  getNowPlayingCache,
  markLiveRefresh,
  setCachedAccessToken,
  setNowPlayingCache,
  shouldSkipLiveRefresh,
} from '../lib/spotify/cache.js'
import { fetchCurrentlyPlaying, toNowPlayingCache } from '../lib/spotify/currentlyPlaying.js'
import { toNowPlayingResponse } from '../lib/spotify/response.js'
import { getQueryParam, type ApiRequest, type ApiResponse } from '../lib/api/vercel.js'

async function getSpotifyAccessToken(): Promise<string> {
  const cached = await getCachedAccessToken()
  if (cached) return cached

  const refreshed = await refreshSpotifyAccessToken()
  await setCachedAccessToken(refreshed.accessToken, refreshed.expiresIn)
  return refreshed.accessToken
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const live = getQueryParam(req, 'live') === '1'

  try {
    const cached = await getNowPlayingCache()

    if (!live) {
      res.status(200).json(toNowPlayingResponse('cache', cached, null))
      return
    }

    if (await shouldSkipLiveRefresh()) {
      res.status(200).json(toNowPlayingResponse('live', cached, null))
      return
    }

    try {
      const accessToken = await getSpotifyAccessToken()
      const playback = await fetchCurrentlyPlaying(accessToken)
      await markLiveRefresh()

      if (playback.track) {
        const nextCache = toNowPlayingCache(playback.track)
        await setNowPlayingCache(nextCache)
        res.status(200).json({
          source: 'live',
          track: nextCache.track,
          isPlaying: playback.isPlaying,
          updatedAt: nextCache.updatedAt,
        })
        return
      }

      res.status(200).json(toNowPlayingResponse('live', cached, playback.isPlaying))
    } catch {
      res.status(200).json(toNowPlayingResponse('cache', cached, null))
    }
  } catch {
    res.status(200).json(toNowPlayingResponse(live ? 'live' : 'cache', null, null))
  }
}
