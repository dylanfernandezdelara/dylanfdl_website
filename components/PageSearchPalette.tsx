'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as stylex from '@stylexjs/stylex'

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { activatePageSearchResult, collectPageSearchTargets } from '@/components/page-search/dom'
import { computeSearchResults, type SearchResult, type SearchTarget } from '@/lib/page-search'

const styles = stylex.create({
  command: {
    backgroundColor: 'transparent',
  },
  inputWrap: {
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  input: {
    height: '3rem',
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: 'var(--fg0)',
    '::placeholder': {
      color: 'var(--fg3)',
    },
  },
  list: {
    maxHeight: 'min(22rem, 60vh)',
    overflowY: 'auto',
    padding: '0.25rem',
  },
  empty: {
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: 'var(--fg3)',
  },
  item: {
    cursor: 'pointer',
    borderRadius: 'var(--radius)',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: 1.45,
    color: 'var(--fg1)',
    ':is([aria-selected="true"])': {
      backgroundColor: 'var(--accent)',
      color: 'var(--fg1)',
    },
  },
})

type PageSearchPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PageSearchPalette({ open, onOpenChange }: PageSearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [targets, setTargets] = useState<SearchTarget<HTMLElement>[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    setTargets(collectPageSearchTargets())
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const results = useMemo<SearchResult<HTMLElement>[]>(() => {
    return computeSearchResults(query, targets, 24)
  }, [query, targets])

  const goToResult = (result: SearchResult<HTMLElement>) => {
    onOpenChange(false)

    requestAnimationFrame(() => {
      activatePageSearchResult(result)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        data-search-overlay="true"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command shouldFilter={false} {...stylex.props(styles.command)}>
          <div {...stylex.props(styles.inputWrap)}>
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
              className={`page-search-input ${stylex.props(styles.input).className ?? ''}`}
            />
          </div>

          {query.length > 0 && (
            <CommandList {...stylex.props(styles.list)}>
              {results.length === 0 ? (
                <CommandEmpty {...stylex.props(styles.empty)}>
                  No matches found.
                </CommandEmpty>
              ) : (
                results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => goToResult(result)}
                    {...stylex.props(styles.item)}
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
