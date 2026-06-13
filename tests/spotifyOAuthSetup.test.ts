import { describe, expect, it, vi } from 'vitest'

import {
  createSpotifyOAuthState,
  isSpotifyOAuthCallbackAuthorized,
  isSpotifyOAuthLoginAuthorized,
  validateSpotifyOAuthState,
} from '@/lib/spotify/oauthSetup'
import type { ApiRequest } from '@/lib/api/vercel'

function makeRequest(query: Record<string, string | undefined> = {}): ApiRequest {
  return {
    query,
    headers: {},
  } as ApiRequest
}

describe('isSpotifyOAuthLoginAuthorized', () => {
  it('returns false when setup is disabled', () => {
    expect(isSpotifyOAuthLoginAuthorized(makeRequest())).toBe(false)
  })

  it('requires the setup secret when configured', () => {
    vi.stubEnv('SPOTIFY_OAUTH_SETUP_ENABLED', 'true')
    vi.stubEnv('SPOTIFY_OAUTH_SETUP_SECRET', 'setup-secret')

    expect(isSpotifyOAuthLoginAuthorized(makeRequest())).toBe(false)
    expect(isSpotifyOAuthLoginAuthorized(makeRequest({ secret: 'setup-secret' }))).toBe(true)

    vi.unstubAllEnvs()
  })
})

describe('isSpotifyOAuthCallbackAuthorized', () => {
  it('allows callback while setup is enabled even without the secret query param', () => {
    vi.stubEnv('SPOTIFY_OAUTH_SETUP_ENABLED', 'true')
    vi.stubEnv('SPOTIFY_OAUTH_SETUP_SECRET', 'setup-secret')

    expect(isSpotifyOAuthCallbackAuthorized()).toBe(true)

    vi.unstubAllEnvs()
  })
})

describe('validateSpotifyOAuthState', () => {
  it('accepts matching state values', () => {
    expect(validateSpotifyOAuthState('abc', 'abc')).toBe(true)
  })

  it('rejects missing or mismatched state values', () => {
    expect(validateSpotifyOAuthState(undefined, 'abc')).toBe(false)
    expect(validateSpotifyOAuthState('abc', 'def')).toBe(false)
  })
})

describe('createSpotifyOAuthState', () => {
  it('returns a hex string', () => {
    expect(createSpotifyOAuthState()).toMatch(/^[a-f0-9]{32}$/)
  })
})
