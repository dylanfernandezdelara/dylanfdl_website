import { getRequestHost, getRequestProto } from './request'

export function getSiteOrigin(headers: Headers): string {
  return `${getRequestProto(headers)}://${getRequestHost(headers)}`
}

function requestOriginMatchesSite(headers: Headers, siteOrigin: string): boolean {
  const origin = headers.get('origin')
  return origin !== null && origin.length > 0 && origin === siteOrigin
}

function requestRefererMatchesSite(headers: Headers, siteOrigin: string): boolean {
  const referer = headers.get('referer')
  return referer !== null && referer.length > 0 && referer.startsWith(`${siteOrigin}/`)
}

export function isSameOriginRequest(headers: Headers): boolean {
  const siteOrigin = getSiteOrigin(headers)

  if (requestOriginMatchesSite(headers, siteOrigin)) {
    return true
  }

  return requestRefererMatchesSite(headers, siteOrigin)
}
