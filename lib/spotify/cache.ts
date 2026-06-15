import { Redis } from '@upstash/redis'

import { SanitizedInfrastructureError } from '../sanitizedInfrastructureError.js'

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

async function redisGet<T>(key: string, context: string): Promise<T | null> {
  const redis = getRedis()
  try {
    return await redis.get<T>(key)
  } catch (error) {
    throw new SanitizedInfrastructureError(context, { cause: error })
  }
}

async function redisSet(key: string, value: unknown, context: string): Promise<void> {
  const redis = getRedis()
  try {
    await redis.set(key, value)
  } catch (error) {
    throw new SanitizedInfrastructureError(context, { cause: error })
  }
}

export async function getNowPlayingCache(): Promise<NowPlayingCache | null> {
  return redisGet<NowPlayingCache>(NOW_PLAYING_CACHE_KEY, 'read now-playing cache')
}

export async function setNowPlayingCache(cache: NowPlayingCache): Promise<void> {
  await redisSet(NOW_PLAYING_CACHE_KEY, cache, 'cache now-playing track')
}

type AccessTokenCache = {
  token: string
  expiresAt: number
}

export async function getCachedAccessToken(): Promise<string | null> {
  const cached = await redisGet<AccessTokenCache>(
    ACCESS_TOKEN_CACHE_KEY,
    'read Spotify access token cache',
  )
  if (!cached) return null
  if (Date.now() >= cached.expiresAt - 60_000) return null
  return cached.token
}

export async function setCachedAccessToken(token: string, expiresInSeconds: number): Promise<void> {
  await redisSet(
    ACCESS_TOKEN_CACHE_KEY,
    {
      token,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    },
    'cache Spotify access token',
  )
}

export async function shouldSkipLiveRefresh(): Promise<boolean> {
  const lastRefresh = await redisGet<number>(LIVE_DEBOUNCE_KEY, 'read live refresh debounce')
  if (!lastRefresh) return false
  return Date.now() - lastRefresh < LIVE_DEBOUNCE_MS
}

export async function markLiveRefresh(): Promise<void> {
  await redisSet(LIVE_DEBOUNCE_KEY, Date.now(), 'mark live refresh debounce')
}
