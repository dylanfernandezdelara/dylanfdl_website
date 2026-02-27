'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'

type SearchTarget = {
  id: string
  text: string
  textLower: string
  element: HTMLElement
}

type SearchResult = {
  id: string
  element: HTMLElement
  text: string
  snippet: string
  matchIndex: number
}

const SEARCHABLE_SELECTOR = 'main p, main li, main h1, main h2, main h3, main h4, main h5, main h6, main a, main blockquote'

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim()

function createSnippet(text: string, index: number, queryLength: number) {
  const windowSize = 90
  const start = Math.max(0, index - 30)
  const end = Math.min(text.length, index + queryLength + windowSize)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''

  return `${prefix}${text.slice(start, end)}${suffix}`
}

export default function PageSearchPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [targets, setTargets] = useState<SearchTarget[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen((prev) => !prev)
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const nextTargets = Array.from(document.querySelectorAll<HTMLElement>(SEARCHABLE_SELECTOR))
      .filter((element) => !element.closest('[data-search-overlay="true"]'))
      .map((element, index) => {
        const text = normalizeText(element.textContent || '')
        return {
          id: `search-target-${index}`,
          text,
          textLower: text.toLowerCase(),
          element,
        }
      })
      .filter((target) => target.text.length > 0)

    setTargets(nextTargets)
    setSelectedIndex(0)

    requestAnimationFrame(() => inputRef.current?.focus())
  }, [isOpen])

  const results = useMemo<SearchResult[]>(() => {
    const nextQuery = normalizeText(query).toLowerCase()

    if (!nextQuery) {
      return []
    }

    return targets
      .map((target) => {
        const matchIndex = target.textLower.indexOf(nextQuery)

        if (matchIndex === -1) {
          return null
        }

        return {
          id: target.id,
          element: target.element,
          text: target.text,
          snippet: createSnippet(target.text, matchIndex, nextQuery.length),
          matchIndex,
        }
      })
      .filter((target): target is SearchResult => target !== null)
      .sort((a, b) => a.matchIndex - b.matchIndex)
      .slice(0, 24)
  }, [query, targets])

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (results.length === 0) {
        return 0
      }

      return Math.min(prev, results.length - 1)
    })
  }, [results])

  const goToResult = (result: SearchResult) => {
    setIsOpen(false)

    requestAnimationFrame(() => {
      result.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      result.element.classList.add('page-search-hit')
      window.setTimeout(() => {
        result.element.classList.remove('page-search-hit')
      }, 1200)
    })
  }

  const onResultsKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (results.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      goToResult(results[selectedIndex])
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="page-search-overlay"
          data-search-overlay="true"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="page-search-panel"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={onResultsKeyDown}
          >
            <input
              ref={inputRef}
              className="page-search-input"
              type="text"
              placeholder="Search this page..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <div className="page-search-results" role="listbox" aria-label="Search results">
              {query.length === 0 ? (
                <p className="page-search-placeholder">
                  Type to search. Use ↑ ↓ then Enter to jump.
                </p>
              ) : results.length === 0 ? (
                <p className="page-search-placeholder">No matches found.</p>
              ) : (
                results.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    className={`page-search-result ${index === selectedIndex ? 'is-selected' : ''}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => goToResult(result)}
                  >
                    {result.snippet}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
