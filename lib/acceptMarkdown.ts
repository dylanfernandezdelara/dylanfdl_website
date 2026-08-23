const PRODUCES = ['text/html', 'text/markdown'] as const

export type ProducedMediaType = (typeof PRODUCES)[number]

type AcceptEntry = {
  type: string
  q: number
  specificity: number
}

function parseAccept(header: string): AcceptEntry[] {
  return header.split(',').map((raw) => {
    const parts = raw
      .trim()
      .split(';')
      .map((token) => token.trim())
    const type = (parts[0] ?? '').toLowerCase()
    let q = 1

    for (const param of parts.slice(1)) {
      const [name, value] = param.split('=').map((token) => token.trim())
      if (name === 'q') {
        const parsed = Number(value)
        if (!Number.isNaN(parsed)) {
          q = Math.max(0, Math.min(1, parsed))
        }
      }
    }

    const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2
    return { type, q, specificity }
  })
}

function matches(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === '*/*') {
    return true
  }
  if (entry.type.endsWith('/*')) {
    return candidate.startsWith(entry.type.slice(0, -1))
  }
  if (candidate === 'text/markdown' && entry.type === 'text/plain') {
    return true
  }
  return entry.type === candidate
}

/**
 * Pick HTML or Markdown from an Accept header using RFC 9110 q-values.
 * Returns null when the client explicitly rejects every representation we produce.
 */
export function preferredType(header: string | null): ProducedMediaType | null {
  if (!header) {
    return 'text/html'
  }

  const entries = parseAccept(header)
  if (entries.length === 0) {
    return 'text/html'
  }

  let bestType: ProducedMediaType | null = null
  let bestQ = -1
  let bestPosition = Number.POSITIVE_INFINITY

  for (const candidate of PRODUCES) {
    let matched: AcceptEntry | null = null
    let matchedPosition = Number.POSITIVE_INFINITY

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index]
      if (!entry || !matches(entry, candidate)) {
        continue
      }

      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && index < matchedPosition)
      ) {
        matched = entry
        matchedPosition = index
      }
    }

    if (matched === null || matched.q <= 0) {
      continue
    }

    if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
      bestQ = matched.q
      bestPosition = matchedPosition
      bestType = candidate
    }
  }

  return bestType
}

export function appendVaryAccept(headers: Headers): void {
  const existing = headers.get('Vary')
  if (!existing) {
    headers.set('Vary', 'Accept')
    return
  }

  const tokens = existing.split(',').map((token) => token.trim().toLowerCase())
  if (!tokens.includes('accept')) {
    headers.set('Vary', `${existing}, Accept`)
  }
}

export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8'

export const NOT_ACCEPTABLE_BODY = 'Not Acceptable\n\nAvailable: text/html, text/markdown\n'

const FRAMEWORK_ACCEPT_TYPES = ['text/x-component'] as const

const DOCUMENT_ACCEPT_HINTS = [
  'text/html',
  'text/markdown',
  'text/plain',
  'application/xhtml',
  'application/pdf',
] as const

function headerPresent(headers: { get(name: string): string | null }, name: string): boolean {
  return Boolean(headers.get(name))
}

/**
 * True when Accept looks like document negotiation (HTML/Markdown/PDF),
 * not a framework or API content type we should leave alone.
 */
export function isDocumentNegotiation(header: string | null): boolean {
  if (!header) {
    return false
  }
  const lower = header.toLowerCase()
  return DOCUMENT_ACCEPT_HINTS.some((hint) => lower.includes(hint))
}

/**
 * Skip markdown negotiation for Next Flight / Server Actions and non-GET
 * requests. Those Accept values are not document negotiation.
 */
export function shouldNegotiate(request: {
  method: string
  headers: { get(name: string): string | null }
}): boolean {
  const method = request.method.toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    return false
  }
  if (headerPresent(request.headers, 'rsc')) {
    return false
  }
  if (headerPresent(request.headers, 'next-action')) {
    return false
  }
  if (headerPresent(request.headers, 'next-router-state-tree')) {
    return false
  }

  const accept = request.headers.get('accept')?.toLowerCase() ?? ''
  return !FRAMEWORK_ACCEPT_TYPES.some((type) => accept.includes(type))
}

export function markdownResponse(body: string, status: 200 | 404 = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      Vary: 'Accept',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
    },
  })
}
