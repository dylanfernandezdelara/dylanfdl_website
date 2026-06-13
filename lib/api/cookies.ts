import type { ApiRequest } from './vercel.js'

export function getCookie(req: ApiRequest, name: string): string | undefined {
  const fromParsed = req.cookies?.[name]
  if (typeof fromParsed === 'string' && fromParsed.length > 0) {
    return fromParsed
  }

  const header = req.headers.cookie
  if (typeof header !== 'string' || header.length === 0) {
    return undefined
  }

  for (const part of header.split(';')) {
    const trimmed = part.trim()
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator)
    if (key !== name) continue
    return decodeURIComponent(trimmed.slice(separator + 1))
  }

  return undefined
}

export function buildSetCookie(
  name: string,
  value: string,
  options: { maxAgeSeconds: number; path: string; secure: boolean },
): string {
  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    'HttpOnly',
    `Path=${options.path}`,
    `Max-Age=${options.maxAgeSeconds}`,
    'SameSite=Lax',
  ]
  if (options.secure) {
    segments.push('Secure')
  }
  return segments.join('; ')
}

export function buildClearCookie(name: string, path: string, secure = false): string {
  const segments = [`${name}=`, 'HttpOnly', `Path=${path}`, 'Max-Age=0', 'SameSite=Lax']
  if (secure) {
    segments.push('Secure')
  }
  return segments.join('; ')
}
