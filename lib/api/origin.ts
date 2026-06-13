import { getRequestHost, getRequestProto, type ApiRequest } from './vercel.js'

export function getSiteOrigin(req: ApiRequest): string {
  return `${getRequestProto(req)}://${getRequestHost(req)}`
}

/** Browser-initiated fetches include Origin; same-tab navigation may send Referer. */
export function isSameOriginRequest(req: ApiRequest): boolean {
  const siteOrigin = getSiteOrigin(req)
  const origin = req.headers.origin
  if (typeof origin === 'string' && origin.length > 0) {
    return origin === siteOrigin
  }

  const referer = req.headers.referer
  if (typeof referer === 'string' && referer.length > 0) {
    return referer.startsWith(`${siteOrigin}/`)
  }

  return false
}
