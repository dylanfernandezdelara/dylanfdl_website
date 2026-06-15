import { SanitizedInfrastructureError } from '../sanitizedInfrastructureError.js'

const SPOTIFY_SCOPE = 'user-read-currently-playing'
const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

type SpotifyTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export function getSpotifyRedirectUri(host: string, proto: string): string {
  return `${proto}://${host}/api/spotify/callback`
}

export function buildSpotifyAuthorizeUrl(redirectUri: string, state: string): string {
  const clientId = requireEnv('SPOTIFY_CLIENT_ID')
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPE,
    state,
  })
  return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`
}

export async function exchangeSpotifyCode(
  code: string,
  redirectUri: string,
): Promise<SpotifyTokenResponse> {
  const clientId = requireEnv('SPOTIFY_CLIENT_ID')
  const clientSecret = requireEnv('SPOTIFY_CLIENT_SECRET')
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new SanitizedInfrastructureError(`exchange Spotify access token (${response.status})`)
  }

  return (await response.json()) as SpotifyTokenResponse
}

export async function refreshSpotifyAccessToken(): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const clientId = requireEnv('SPOTIFY_CLIENT_ID')
  const clientSecret = requireEnv('SPOTIFY_CLIENT_SECRET')
  const refreshToken = requireEnv('SPOTIFY_REFRESH_TOKEN')
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new SanitizedInfrastructureError(`refresh Spotify access token (${response.status})`)
  }

  const data = (await response.json()) as SpotifyTokenResponse
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}
