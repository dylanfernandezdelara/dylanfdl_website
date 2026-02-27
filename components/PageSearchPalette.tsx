'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  SEARCHABLE_SELECTOR,
  computeSearchResults,
  dedupeStructuralTargets,
  normalizeText,
  type SearchResult,
  type SearchTarget,
} from '@/lib/page-search'

export default function PageSearchPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [targets, setTargets] = useState<SearchTarget<HTMLElement>[]>([])
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
      setQuery('')
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
          order: index,
        }
      })
      .filter((target) => target.text.length > 0)

    const structurallyDeduped = dedupeStructuralTargets(nextTargets, (possibleAncestor, possibleDescendant) => {
      return possibleAncestor.contains(possibleDescendant)
    })

    setTargets(structurallyDeduped)

    requestAnimationFrame(() => inputRef.current?.focus())
  }, [isOpen])

  const results = useMemo<SearchResult<HTMLElement>[]>(() => {
    return computeSearchResults(query, targets, 24)
  }, [query, targets])

  const goToResult = (result: SearchResult<HTMLElement>) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        data-search-overlay="true"
        aria-describedby="page-search-description"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="top-24 w-[min(40rem,calc(100%-2rem))] translate-y-0 gap-0 overflow-hidden rounded-2xl border border-[color:color-mix(in_oklab,white,transparent_35%)] bg-[color:color-mix(in_oklab,var(--bg0),white_22%)] p-0 shadow-[0_16px_40px_rgba(42,42,42,0.22)] backdrop-blur-[24px] saturate-[130%] max-md:top-20"
      >
        <DialogTitle className="sr-only">Search this page</DialogTitle>
        <DialogDescription id="page-search-description" className="sr-only">
          Type to search current page content. Use arrow keys and Enter to jump.
        </DialogDescription>
        <Command shouldFilter={false} className="bg-transparent">
          <div className="border-b border-[color:color-mix(in_oklab,var(--bg3),transparent_20%)] px-4">
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search this page..."
              className="page-search-input h-12 py-0 text-[0.95rem] text-fg0 placeholder:text-fg3 focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0"
            />
          </div>

          <CommandList className="max-h-[min(22rem,60vh)] overflow-y-auto p-1">
            {query.length === 0 ? (
              <p className="px-3 py-3 text-[0.85rem] text-fg3">
                Type to search. Use ↑ ↓ then Enter to jump.
              </p>
            ) : results.length === 0 ? (
              <CommandEmpty className="px-3 py-3 text-left text-[0.85rem] text-fg3">
                No matches found.
              </CommandEmpty>
            ) : (
              results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => goToResult(result)}
                  className="cursor-pointer rounded-[0.55rem] px-[0.7rem] py-[0.65rem] text-left text-[0.87rem] leading-[1.45] text-fg1 aria-selected:bg-[color:color-mix(in_oklab,var(--bg3),white_35%)] aria-selected:text-fg1"
                >
                  {result.snippet}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
