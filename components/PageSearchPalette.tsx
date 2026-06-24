'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { activatePageSearchResult, collectPageSearchTargets } from '@/components/page-search/dom'
import { computeSearchResults, type SearchResult, type SearchTarget } from '@/lib/page-search'

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

    setTargets(collectPageSearchTargets())
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [isOpen])

  const results = useMemo<SearchResult<HTMLElement>[]>(() => {
    return computeSearchResults(query, targets, 24)
  }, [query, targets])

  const goToResult = (result: SearchResult<HTMLElement>) => {
    setIsOpen(false)

    requestAnimationFrame(() => {
      activatePageSearchResult(result)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        data-search-overlay="true"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="top-[16.667%] w-[min(40rem,calc(100%-2rem))] -translate-y-1/2 gap-0 overflow-hidden rounded-2xl border border-bg3/55 bg-popover p-0 shadow-[var(--elevated-shadow)] backdrop-blur-[24px] saturate-[130%]"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command shouldFilter={false} className="bg-transparent">
          <div className="px-4">
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              name="page-search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="search"
              enterKeyHint="search"
              data-1p-ignore="true"
              data-lpignore="true"
              className="page-search-input h-12 py-0 text-[0.95rem] text-fg0 placeholder:text-fg3"
            />
          </div>

          {query.length > 0 && (
            <CommandList className="max-h-[min(22rem,60vh)] overflow-y-auto p-1">
              {results.length === 0 ? (
                <CommandEmpty className="px-3 py-3 text-left text-[0.85rem] text-fg3">
                  No matches found.
                </CommandEmpty>
              ) : (
                results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => goToResult(result)}
                    className="cursor-pointer rounded-[0.55rem] px-[0.7rem] py-[0.65rem] text-left text-[0.87rem] leading-[1.45] text-fg1 aria-selected:bg-accent aria-selected:text-fg1"
                  >
                    {result.snippet}
                  </CommandItem>
                ))
              )}
            </CommandList>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
