import type { IncomingMessage, ServerResponse } from 'node:http'

export type ApiRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>
  cookies?: Record<string, string>
}

export type ApiResponse = ServerResponse & {
  status: (statusCode: number) => ApiResponse
  json: (body: unknown) => ApiResponse
  send: (body: string) => ApiResponse
  redirect: (statusCode: number, url: string) => ApiResponse
}

export function getRequestHost(req: ApiRequest): string {
  const forwardedHost = req.headers['x-forwarded-host']
  if (typeof forwardedHost === 'string' && forwardedHost.length > 0) {
    return forwardedHost
  }
  const host = req.headers.host
  if (typeof host === 'string' && host.length > 0) {
    return host
  }
  return '127.0.0.1:3000'
}

export function getRequestProto(req: ApiRequest): string {
  const forwardedProto = req.headers['x-forwarded-proto']
  if (typeof forwardedProto === 'string' && forwardedProto.length > 0) {
    return forwardedProto
  }
  return 'http'
}

export function getQueryParam(
  req: ApiRequest,
  key: string,
): string | undefined {
  const value = req.query[key]
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}
