import { buildSpotifyAuthorizeUrl, getSpotifyRedirectUri } from '@/lib/spotify/auth'
import {
  getRequestHost,
  getRequestProto,
  type ApiRequest,
  type ApiResponse,
} from '@/lib/api/vercel'

export default function handler(req: ApiRequest, res: ApiResponse): void {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const redirectUri = getSpotifyRedirectUri(getRequestHost(req), getRequestProto(req))
  const authorizeUrl = buildSpotifyAuthorizeUrl(redirectUri)
  res.redirect(302, authorizeUrl)
}
