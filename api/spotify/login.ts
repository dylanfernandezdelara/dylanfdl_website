import {
  buildSpotifyAuthorizeUrl,
  getSpotifyRedirectUri,
} from '../../lib/spotify/auth.js'
import {
  createSpotifyOAuthState,
  isSpotifyOAuthLoginAuthorized,
  SPOTIFY_OAUTH_COOKIE_PATH,
  SPOTIFY_OAUTH_STATE_COOKIE,
  SPOTIFY_OAUTH_STATE_MAX_AGE_SECONDS,
} from '../../lib/spotify/oauthSetup.js'
import { buildSetCookie } from '../../lib/api/cookies.js'
import { getRequestHost, getRequestProto, type ApiRequest, type ApiResponse } from '../../lib/api/vercel.js'

export default function handler(req: ApiRequest, res: ApiResponse): void {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!isSpotifyOAuthLoginAuthorized(req)) {
    res.status(404).send('Not found')
    return
  }

  const proto = getRequestProto(req)
  const redirectUri = getSpotifyRedirectUri(getRequestHost(req), proto)
  const state = createSpotifyOAuthState()
  const authorizeUrl = buildSpotifyAuthorizeUrl(redirectUri, state)

  res.setHeader(
    'Set-Cookie',
    buildSetCookie(SPOTIFY_OAUTH_STATE_COOKIE, state, {
      maxAgeSeconds: SPOTIFY_OAUTH_STATE_MAX_AGE_SECONDS,
      path: SPOTIFY_OAUTH_COOKIE_PATH,
      secure: proto === 'https',
    }),
  )
  res.redirect(302, authorizeUrl)
}
