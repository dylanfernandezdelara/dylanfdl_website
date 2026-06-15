import { isSameOriginRequest } from '../lib/api/origin.js'
import { logNowPlayingError, logNowPlayingWarn } from '../lib/nowPlaying/logWarning.js'
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
import { toLiveTrackResponse, toNowPlayingResponse } from '../lib/spotify/response.js'
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

  if (live && !isSameOriginRequest(req)) {
    res.status(403).json({ error: 'Live refresh requires a same-origin request' })
    return
  }

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
        res.status(200).json(
          toLiveTrackResponse(nextCache.track, playback.isPlaying, nextCache.updatedAt),
        )
        return
      }

      res.status(200).json(toNowPlayingResponse('live', cached, playback.isPlaying))
    } catch (error) {
      logNowPlayingWarn('live refresh failed', error)
      res.status(200).json(toNowPlayingResponse('cache', cached, null))
    }
  } catch (error) {
    logNowPlayingError('request failed', error)
    res.status(200).json(toNowPlayingResponse(live ? 'live' : 'cache', null, null))
  }
}
