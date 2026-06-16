import {
  exchangeSpotifyCode,
  getSpotifyRedirectUri,
} from '../../lib/spotify/auth.js'
import { buildClearCookie, getCookie } from '../../lib/api/cookies.js'
import { extractErrorMessage } from '../../lib/extractErrorMessage.js'
import {
  getQueryParam,
  getRequestHost,
  getRequestProto,
  type ApiRequest,
  type ApiResponse,
} from '../../lib/api/vercel.js'
import {
  isSpotifyOAuthCallbackAuthorized,
  SPOTIFY_OAUTH_COOKIE_PATH,
  SPOTIFY_OAUTH_STATE_COOKIE,
  validateSpotifyOAuthState,
} from '../../lib/spotify/oauthSetup.js'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!isSpotifyOAuthCallbackAuthorized()) {
    res.status(404).send('Not found')
    return
  }

  const error = getQueryParam(req, 'error')
  if (error) {
    res.status(400).send(`Spotify authorization failed: ${escapeHtml(error)}`)
    return
  }

  const state = getQueryParam(req, 'state')
  const cookieState = getCookie(req, SPOTIFY_OAUTH_STATE_COOKIE)
  if (!validateSpotifyOAuthState(state, cookieState)) {
    res.status(400).send('Invalid OAuth state. Start again at /api/spotify/login')
    return
  }

  const proto = getRequestProto(req)
  res.setHeader(
    'Set-Cookie',
    buildClearCookie(SPOTIFY_OAUTH_STATE_COOKIE, SPOTIFY_OAUTH_COOKIE_PATH, proto === 'https'),
  )

  const code = getQueryParam(req, 'code')
  if (!code) {
    res.status(400).send('Missing authorization code. Start at /api/spotify/login')
    return
  }

  try {
    const redirectUri = getSpotifyRedirectUri(getRequestHost(req), getRequestProto(req))
    const tokens = await exchangeSpotifyCode(code, redirectUri)
    const refreshToken = tokens.refresh_token

    if (!refreshToken) {
      res
        .status(500)
        .send('Spotify did not return a refresh token. Revoke app access and try again.')
      return
    }

    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Spotify OAuth Complete</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
      code, pre { background: #f4f4f5; border-radius: 0.375rem; }
      pre { padding: 1rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
    </style>
  </head>
  <body>
    <h1>Spotify OAuth complete</h1>
    <p>Add this value to Vercel as <code>SPOTIFY_REFRESH_TOKEN</code> (Production and Preview):</p>
    <pre>${escapeHtml(refreshToken)}</pre>
    <p>Disable <code>SPOTIFY_OAUTH_SETUP_ENABLED</code> after saving the token. Do not commit this token to git.</p>
  </body>
</html>`)
  } catch (caught) {
    const message = extractErrorMessage(caught)
    res.status(500).send(`OAuth callback failed: ${escapeHtml(message)}`)
  }
}
