import { getRequestHost, getRequestProto, type ApiRequest } from './vercel.js'

export function getSiteOrigin(req: ApiRequest): string {
  return `${getRequestProto(req)}://${getRequestHost(req)}`
}

function requestOriginMatchesSite(req: ApiRequest, siteOrigin: string): boolean {
  const origin = req.headers.origin
  return typeof origin === 'string' && origin.length > 0 && origin === siteOrigin
}

function requestRefererMatchesSite(req: ApiRequest, siteOrigin: string): boolean {
  const referer = req.headers.referer
  return typeof referer === 'string' && referer.length > 0 && referer.startsWith(`${siteOrigin}/`)
}

export function isSameOriginRequest(req: ApiRequest): boolean {
  const siteOrigin = getSiteOrigin(req)

  if (requestOriginMatchesSite(req, siteOrigin)) {
    return true
  }

  return requestRefererMatchesSite(req, siteOrigin)
}
