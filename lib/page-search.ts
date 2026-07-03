export const SEARCHABLE_SELECTOR =
  'main p, main li, main h1, main h2, main h3, main h4, main h5, main h6, main blockquote'

export type SearchTarget<T = HTMLElement> = {
  id: string
  text: string
  textLower: string
  element: T
  order: number
}

export type SearchResult<T = HTMLElement> = {
  id: string
  element: T
  text: string
  snippet: string
  matchIndex: number
  order: number
}

export const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim()

export function createSnippet(text: string, index: number, queryLength: number): string {
  const windowSize = 90
  const start = Math.max(0, index - 30)
  const end = Math.min(text.length, index + queryLength + windowSize)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''

  return `${prefix}${text.slice(start, end)}${suffix}`
}

export function dedupeStructuralTargets<T>(
  targets: SearchTarget<T>[],
  isAncestor: (possibleAncestor: T, possibleDescendant: T) => boolean
): SearchTarget<T>[] {
  const sorted = [...targets].sort((a, b) => a.order - b.order)
  const deduped: SearchTarget<T>[] = []

  for (const candidate of sorted) {
    let wasHandled = false

    for (let index = 0; index < deduped.length; index++) {
      const existing = deduped[index]

      if (existing.textLower !== candidate.textLower) {
        continue
      }

      const existingContainsCandidate = isAncestor(existing.element, candidate.element)
      const candidateContainsExisting = isAncestor(candidate.element, existing.element)

      if (!existingContainsCandidate && !candidateContainsExisting) {
        continue
      }

      const preferCandidateAsDeeperDuplicate =
        existingContainsCandidate && !candidateContainsExisting

      if (preferCandidateAsDeeperDuplicate) {
        deduped[index] = candidate
      }

      wasHandled = true
      break
    }

    if (!wasHandled) {
      deduped.push(candidate)
    }
  }

  return deduped.sort((a, b) => a.order - b.order)
}

function compareRank<T>(a: SearchResult<T>, b: SearchResult<T>): number {
  if (a.matchIndex !== b.matchIndex) return a.matchIndex - b.matchIndex
  if (a.text.length !== b.text.length) return a.text.length - b.text.length
  return a.order - b.order
}

export function computeSearchResults<T>(
  query: string,
  targets: SearchTarget<T>[],
  limit: number = 24
): SearchResult<T>[] {
  const nextQuery = normalizeText(query).toLowerCase()

  if (!nextQuery) {
    return []
  }

  const rankedMatches: SearchResult<T>[] = []

  for (const target of targets) {
    const matchIndex = target.textLower.indexOf(nextQuery)

    if (matchIndex === -1) {
      continue
    }

    rankedMatches.push({
      id: target.id,
      element: target.element,
      text: target.text,
      snippet: createSnippet(target.text, matchIndex, nextQuery.length),
      matchIndex,
      order: target.order,
    })
  }

  const bestByText = new Map<string, SearchResult<T>>()

  for (const match of rankedMatches) {
    const key = normalizeText(match.text).toLowerCase()
    const existing = bestByText.get(key)

    if (!existing || compareRank(match, existing) < 0) {
      bestByText.set(key, match)
    }
  }

  return Array.from(bestByText.values())
    .sort((a, b) => compareRank(a, b))
    .slice(0, limit)
}
