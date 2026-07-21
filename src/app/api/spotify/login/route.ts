import { buildSetCookie } from '@/lib/api/cookies'
import { getRequestHost, getRequestProto } from '@/lib/api/request'
import {
  buildSpotifyAuthorizeUrl,
  getSpotifyRedirectUri,
} from '@/lib/spotify/auth'
import {
  createSpotifyOAuthState,
  isSpotifyOAuthLoginAuthorized,
  SPOTIFY_OAUTH_COOKIE_PATH,
  SPOTIFY_OAUTH_STATE_COOKIE,
  SPOTIFY_OAUTH_STATE_MAX_AGE_SECONDS,
} from '@/lib/spotify/oauthSetup'

export function GET(request: Request): Response {
  const searchParams = new URL(request.url).searchParams

  if (!isSpotifyOAuthLoginAuthorized(searchParams.get('secret') ?? undefined)) {
    return new Response('Not found', { status: 404 })
  }

  const proto = getRequestProto(request.headers)
  const redirectUri = getSpotifyRedirectUri(getRequestHost(request.headers), proto)
  const state = createSpotifyOAuthState()
  const authorizeUrl = buildSpotifyAuthorizeUrl(redirectUri, state)

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl,
      'Set-Cookie': buildSetCookie(SPOTIFY_OAUTH_STATE_COOKIE, state, {
        maxAgeSeconds: SPOTIFY_OAUTH_STATE_MAX_AGE_SECONDS,
        path: SPOTIFY_OAUTH_COOKIE_PATH,
        secure: proto === 'https',
      }),
    },
  })
}
