'use client'

import { type KeyboardEvent } from 'react'

import { TAB_OPTIONS } from '@/components/card-grid/constants'
import useTabIndicator from '@/components/card-grid/useTabIndicator'
import type { CardGridFilter } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

const tabButtonBase =
  'relative z-10 inline-flex items-center rounded-sm px-2 text-sm font-medium leading-4 transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

type Props = {
  filter: CardGridFilter
  onSelect: (filter: CardGridFilter) => void
}

export default function CardGridTabs({ filter, onSelect }: Props) {
  const { tablistRef, tabButtonRefs, showPill, indicatorStyle } = useTabIndicator(filter)

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = TAB_OPTIONS.length - 1
    let nextIndex: number | null = null

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = index === lastIndex ? 0 : index + 1
        break
      case 'ArrowLeft':
        nextIndex = index === 0 ? lastIndex : index - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    const nextFilter = TAB_OPTIONS[nextIndex]?.id
    if (!nextFilter) {
      return
    }

    onSelect(nextFilter)
    tabButtonRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Filter work"
        className="relative inline-flex h-8 items-stretch rounded-md bg-bg2 p-0.5 ring-1 ring-bg3"
      >
        {showPill ? (
          <span
            aria-hidden
            className="pointer-events-none absolute z-0 rounded-sm bg-bg0 shadow-sm motion-reduce:hidden"
            style={indicatorStyle}
          />
        ) : null}
        {TAB_OPTIONS.map(({ id, label }, index) => {
          const selected = filter === id
          const selectedClass = showPill
            ? 'text-fg0 motion-reduce:bg-bg0 motion-reduce:shadow-sm'
            : 'bg-bg0 text-fg0 shadow-sm'

          return (
            <button
              key={id}
              id={`tab-${id}`}
              ref={(element) => {
                tabButtonRefs.current[index] = element
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected ? 'tabpanel-work' : undefined}
              tabIndex={selected ? 0 : -1}
              className={cn(tabButtonBase, selected ? selectedClass : 'text-fg3 hover:text-fg1')}
              onClick={() => onSelect(id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
