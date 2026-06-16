import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SanitizedInfrastructureError } from '@/lib/sanitizedInfrastructureError'
import {
  buildSpotifyAuthorizeUrl,
  exchangeSpotifyCode,
  refreshSpotifyAccessToken,
} from '@/lib/spotify/auth'

const SECRET_BODY = '{"access_token":"SECRET_TOKEN_VALUE"}'

describe('spotify auth error sanitization', () => {
  beforeEach(() => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'client-id')
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'client-secret')
    vi.stubEnv('SPOTIFY_REFRESH_TOKEN', 'refresh-token')
    vi.unstubAllGlobals()
  })

  it('sanitizes token exchange failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => SECRET_BODY,
      }),
    )

    const error = await exchangeSpotifyCode('auth-code', 'https://example.com/callback').catch(
      (caught) => caught,
    )

    expect(error).toBeInstanceOf(SanitizedInfrastructureError)
    expect((error as Error).message).toBe('Failed to exchange Spotify access token (400)')
    expect((error as Error).message).not.toContain('SECRET_TOKEN_VALUE')
  })

  it('sanitizes missing configuration errors', () => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', '')

    expect(() => buildSpotifyAuthorizeUrl('https://example.com/callback', 'state')).toThrow(
      SanitizedInfrastructureError,
    )
  })

  it('sanitizes token refresh failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => SECRET_BODY,
      }),
    )

    const error = await refreshSpotifyAccessToken().catch((caught) => caught)

    expect(error).toBeInstanceOf(SanitizedInfrastructureError)
    expect((error as Error).message).toBe('Failed to refresh Spotify access token (401)')
    expect((error as Error).message).not.toContain('SECRET_TOKEN_VALUE')
  })
})
