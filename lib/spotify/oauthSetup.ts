import { randomBytes, timingSafeEqual } from 'node:crypto'

export const SPOTIFY_OAUTH_STATE_COOKIE = 'spotify_oauth_state'
export const SPOTIFY_OAUTH_COOKIE_PATH = '/api/spotify'
export const SPOTIFY_OAUTH_STATE_MAX_AGE_SECONDS = 600

export function isSpotifyOAuthSetupEnabled(): boolean {
  return process.env.SPOTIFY_OAUTH_SETUP_ENABLED === 'true'
}

export function isSpotifyOAuthLoginAuthorized(providedSecret: string | undefined): boolean {
  if (!isSpotifyOAuthSetupEnabled()) {
    return false
  }

  const setupSecret = process.env.SPOTIFY_OAUTH_SETUP_SECRET
  if (!setupSecret) {
    return false
  }

  if (typeof providedSecret !== 'string' || providedSecret.length === 0) {
    return false
  }

  return safeEqual(providedSecret, setupSecret)
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
