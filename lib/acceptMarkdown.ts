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
