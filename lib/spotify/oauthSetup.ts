import { randomBytes, timingSafeEqual } from 'node:crypto'

import type { ApiRequest } from '../api/vercel.js'

export const SPOTIFY_OAUTH_STATE_COOKIE = 'spotify_oauth_state'
export const SPOTIFY_OAUTH_COOKIE_PATH = '/api/spotify'
export const SPOTIFY_OAUTH_STATE_MAX_AGE_SECONDS = 600

export function isSpotifyOAuthSetupEnabled(): boolean {
  return process.env.SPOTIFY_OAUTH_SETUP_ENABLED === 'true'
}

export function isSpotifyOAuthLoginAuthorized(req: ApiRequest): boolean {
  if (!isSpotifyOAuthSetupEnabled()) {
    return false
  }

  const setupSecret = process.env.SPOTIFY_OAUTH_SETUP_SECRET
  if (!setupSecret) {
    return true
  }

  const query = req.query.secret
  const provided = Array.isArray(query) ? query[0] : query
  if (typeof provided !== 'string' || provided.length === 0) {
    return false
  }

  return safeEqual(provided, setupSecret)
}

export function isSpotifyOAuthCallbackAuthorized(): boolean {
  return isSpotifyOAuthSetupEnabled()
}

export function createSpotifyOAuthState(): string {
  return randomBytes(16).toString('hex')
}

export function validateSpotifyOAuthState(
  queryState: string | undefined,
  cookieState: string | undefined,
): boolean {
  if (!queryState || !cookieState) {
    return false
  }
  return safeEqual(queryState, cookieState)
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return timingSafeEqual(leftBuffer, rightBuffer)
}
