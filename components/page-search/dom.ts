import {
  SEARCHABLE_SELECTOR,
  dedupeStructuralTargets,
  getSearchableElementText,
  type SearchResult,
  type SearchTarget,
} from '@/lib/page-search'

export function collectPageSearchTargets(): SearchTarget<HTMLElement>[] {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(SEARCHABLE_SELECTOR))
    .filter((element) => !element.closest('[data-search-overlay="true"]'))
    .map((element, index) => {
      const text = getSearchableElementText(element)

      return {
        id: `search-target-${index}`,
        text,
        textLower: text.toLowerCase(),
        element,
        order: index,
      }
    })
    .filter((target) => target.text.length > 0)

  return dedupeStructuralTargets(targets, (possibleAncestor, possibleDescendant) =>
    possibleAncestor.contains(possibleDescendant)
  )
}

export function activatePageSearchResult(result: SearchResult<HTMLElement>) {
  result.element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })

  result.element.classList.add('page-search-hit')
  window.setTimeout(() => {
    result.element.classList.remove('page-search-hit')
  }, 1200)
}
