import { buildClearCookie, getCookie } from '@/lib/api/cookies'
import { getRequestHost, getRequestProto } from '@/lib/api/request'
import { escapeHtml } from '@/lib/escapeHtml'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import {
  exchangeSpotifyCode,
  getSpotifyRedirectUri,
} from '@/lib/spotify/auth'
import {
  isSpotifyOAuthCallbackAuthorized,
  SPOTIFY_OAUTH_COOKIE_PATH,
  SPOTIFY_OAUTH_STATE_COOKIE,
  validateSpotifyOAuthState,
} from '@/lib/spotify/oauthSetup'

export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  if (!isSpotifyOAuthCallbackAuthorized()) {
    return new Response('Not found', { status: 404 })
  }

  const searchParams = new URL(request.url).searchParams
  const error = searchParams.get('error')
  if (error) {
    return new Response(`Spotify authorization failed: ${escapeHtml(error)}`, { status: 400 })
  }

  const state = searchParams.get('state') ?? undefined
  const cookieState = getCookie(request.headers, SPOTIFY_OAUTH_STATE_COOKIE)
  if (!validateSpotifyOAuthState(state, cookieState)) {
    return new Response('Invalid OAuth state. Start again at /api/spotify/login', { status: 400 })
  }

  const proto = getRequestProto(request.headers)
  const clearCookie = buildClearCookie(SPOTIFY_OAUTH_STATE_COOKIE, SPOTIFY_OAUTH_COOKIE_PATH, proto === 'https')

  const code = searchParams.get('code')
  if (!code) {
    return new Response('Missing authorization code. Start at /api/spotify/login', {
      status: 400,
      headers: { 'Set-Cookie': clearCookie },
    })
  }

  try {
    const redirectUri = getSpotifyRedirectUri(getRequestHost(request.headers), getRequestProto(request.headers))
    const tokens = await exchangeSpotifyCode(code, redirectUri)
    const refreshToken = tokens.refresh_token

    if (!refreshToken) {
      return new Response('Spotify did not return a refresh token. Revoke app access and try again.', {
        status: 500,
        headers: { 'Set-Cookie': clearCookie },
      })
    }

    return new Response(
      `<!DOCTYPE html>
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
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Set-Cookie': clearCookie,
        },
      },
    )
  } catch (caught) {
    const message = extractErrorMessage(caught)
    return new Response(`OAuth callback failed: ${escapeHtml(message)}`, {
      status: 500,
      headers: { 'Set-Cookie': clearCookie },
    })
  }
}
