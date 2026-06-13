// TEMPORARY diagnostic endpoint — remove before merge. Do not rely on this in production.

import { refreshSpotifyAccessToken } from '../lib/spotify/auth.js'
import { getNowPlayingCache } from '../lib/spotify/cache.js'
import { fetchCurrentlyPlaying } from '../lib/spotify/currentlyPlaying.js'
import { type ApiRequest, type ApiResponse } from '../lib/api/vercel.js'

const ENV_VARS = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REFRESH_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
] as const

function sanitizeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isEnvPresent(name: string): boolean {
  const value = process.env[name]
  return typeof value === 'string' && value.length > 0
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const result: {
      env: Record<(typeof ENV_VARS)[number], boolean> | null
      kv: { ok: true; hasCachedTrack: boolean } | { ok: false; error: string } | null
      tokenRefresh:
        | { ok: true; expiresIn: number }
        | { ok: false; error: string }
        | null
      currentlyPlaying:
        | { ok: true; isPlaying: boolean; hasTrack: boolean; trackName: string | null }
        | { ok: false; error: string }
        | null
    } = {
      env: null,
      kv: null,
      tokenRefresh: null,
      currentlyPlaying: null,
    }

    result.env = Object.fromEntries(
      ENV_VARS.map((name) => [name, isEnvPresent(name)]),
    ) as Record<(typeof ENV_VARS)[number], boolean>

    try {
      const cached = await getNowPlayingCache()
      result.kv = { ok: true, hasCachedTrack: cached?.track != null }
    } catch (error) {
      result.kv = { ok: false, error: sanitizeError(error) }
    }

    let accessToken: string | null = null
    try {
      const refreshed = await refreshSpotifyAccessToken()
      accessToken = refreshed.accessToken
      result.tokenRefresh = { ok: true, expiresIn: refreshed.expiresIn }
    } catch (error) {
      result.tokenRefresh = { ok: false, error: sanitizeError(error) }
    }

    if (result.tokenRefresh?.ok === true && accessToken) {
      try {
        const playback = await fetchCurrentlyPlaying(accessToken)
        result.currentlyPlaying = {
          ok: true,
          isPlaying: playback.isPlaying,
          hasTrack: playback.track != null,
          trackName: playback.track?.name ?? null,
        }
      } catch (error) {
        result.currentlyPlaying = { ok: false, error: sanitizeError(error) }
      }
    }

    res.status(200).json(result)
  } catch (error) {
    res.status(200).json({ ok: false, error: sanitizeError(error) })
  }
}
