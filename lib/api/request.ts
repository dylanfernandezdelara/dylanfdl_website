export function getRequestHost(headers: Headers): string {
  const forwardedHost = headers.get('x-forwarded-host')
  if (forwardedHost && forwardedHost.length > 0) {
    return forwardedHost
  }
  const host = headers.get('host')
  if (host && host.length > 0) {
    return host
  }
  return '127.0.0.1:3000'
}

export function getRequestProto(headers: Headers): string {
  const forwardedProto = headers.get('x-forwarded-proto')
  if (forwardedProto && forwardedProto.length > 0) {
    return forwardedProto
  }
  return 'http'
}
