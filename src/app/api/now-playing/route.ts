import { handleNowPlayingRequest } from '@/lib/nowPlaying/handleNowPlayingRequest'

export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  return handleNowPlayingRequest(request)
}
