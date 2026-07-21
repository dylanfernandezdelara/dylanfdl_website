import { isSameOriginRequest } from '@/lib/api/origin'
import { logNowPlayingError, logNowPlayingWarn } from '@/lib/nowPlaying/logNowPlaying'
import { refreshSpotifyAccessToken } from '@/lib/spotify/auth'
import {
  getCachedAccessToken,
  getNowPlayingCache,
  markLiveRefresh,
  setCachedAccessToken,
  setNowPlayingCache,
  shouldSkipLiveRefresh,
} from '@/lib/spotify/cache'
import { fetchCurrentlyPlaying, toNowPlayingCache } from '@/lib/spotify/currentlyPlaying'
import { toLiveTrackResponse, toNowPlayingResponse } from '@/lib/spotify/response'

async function getSpotifyAccessToken(): Promise<string> {
  const cached = await getCachedAccessToken()
  if (cached) return cached

  const refreshed = await refreshSpotifyAccessToken()
  await setCachedAccessToken(refreshed.accessToken, refreshed.expiresIn)
  return refreshed.accessToken
}

export async function handleNowPlayingRequest(request: Request): Promise<Response> {
  const live = new URL(request.url).searchParams.get('live') === '1'

  if (live && !isSameOriginRequest(request.headers)) {
    return Response.json({ error: 'Live refresh requires a same-origin request' }, { status: 403 })
  }

  try {
    const cached = await getNowPlayingCache()

    if (!live) {
      return Response.json(toNowPlayingResponse('cache', cached, cached?.isPlaying ?? null))
    }

    if (await shouldSkipLiveRefresh()) {
      return Response.json(toNowPlayingResponse('live', cached, cached?.isPlaying ?? null))
    }

    try {
      const accessToken = await getSpotifyAccessToken()
      const playback = await fetchCurrentlyPlaying(accessToken)

      if (playback.track) {
        const nextCache = toNowPlayingCache(playback.track, playback.isPlaying)
        await setNowPlayingCache(nextCache)
        await markLiveRefresh()
        return Response.json(
          toLiveTrackResponse(nextCache.track, playback.isPlaying, nextCache.updatedAt),
        )
      }

      if (cached) {
        const nextCache = {
          ...cached,
          isPlaying: playback.isPlaying,
          updatedAt: new Date().toISOString(),
        }
        await setNowPlayingCache(nextCache)
        await markLiveRefresh()
        return Response.json(toNowPlayingResponse('live', nextCache, playback.isPlaying))
      }

      await markLiveRefresh()
      return Response.json(toNowPlayingResponse('live', cached, playback.isPlaying))
    } catch (error) {
      logNowPlayingWarn('live refresh failed', error)
      return Response.json(toNowPlayingResponse('cache', cached, cached?.isPlaying ?? null))
    }
  } catch (error) {
    logNowPlayingError('request failed', error)
    return Response.json(toNowPlayingResponse(live ? 'live' : 'cache', null, null))
  }
}
