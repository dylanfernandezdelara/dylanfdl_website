import { Redis } from '@upstash/redis'

import type { NowPlayingCache } from './types'

export const NOW_PLAYING_CACHE_KEY = 'dylanfdl:spotify:now-playing'
export const ACCESS_TOKEN_CACHE_KEY = 'dylanfdl:spotify:access-token'
export const LIVE_DEBOUNCE_KEY = 'dylanfdl:spotify:live-debounce'

const LIVE_DEBOUNCE_MS = 10_000

let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN
    if (!url || !token) {
      throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN')
    }
    redisClient = new Redis({ url, token })
  }
  return redisClient
}

export async function getNowPlayingCache(): Promise<NowPlayingCache | null> {
  const redis = getRedis()
  return redis.get<NowPlayingCache>(NOW_PLAYING_CACHE_KEY)
}

export async function setNowPlayingCache(cache: NowPlayingCache): Promise<void> {
  const redis = getRedis()
  await redis.set(NOW_PLAYING_CACHE_KEY, cache)
}

type AccessTokenCache = {
  token: string
  expiresAt: number
}

export async function getCachedAccessToken(): Promise<string | null> {
  const redis = getRedis()
  const cached = await redis.get<AccessTokenCache>(ACCESS_TOKEN_CACHE_KEY)
  if (!cached) return null
  if (Date.now() >= cached.expiresAt - 60_000) return null
  return cached.token
}

export async function setCachedAccessToken(token: string, expiresInSeconds: number): Promise<void> {
  const redis = getRedis()
  try {
    await redis.set(ACCESS_TOKEN_CACHE_KEY, {
      token,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    })
  } catch {
    // Upstash embeds the SET command body (which includes the access token) in its
    // error message; rethrow a sanitized error so the token can never reach logs.
    throw new Error('Failed to cache Spotify access token')
  }
}

export async function shouldSkipLiveRefresh(): Promise<boolean> {
  const redis = getRedis()
  const lastRefresh = await redis.get<number>(LIVE_DEBOUNCE_KEY)
  if (!lastRefresh) return false
  return Date.now() - lastRefresh < LIVE_DEBOUNCE_MS
}

export async function markLiveRefresh(): Promise<void> {
  const redis = getRedis()
  await redis.set(LIVE_DEBOUNCE_KEY, Date.now())
}
