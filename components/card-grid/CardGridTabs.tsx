'use client'

import type { CSSProperties, KeyboardEvent, MutableRefObject, RefObject } from 'react'

import { TAB_OPTIONS } from '@/components/card-grid/constants'
import type { CardGridFilter } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

const tabButtonBase =
  'relative z-10 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

type TabIndicator = {
  left: number
  top: number
  width: number
  height: number
}

type Props = {
  filter: CardGridFilter
  indicator: TabIndicator
  indicatorReady: boolean
  indicatorStyle: CSSProperties
  tabButtonRefs: MutableRefObject<(HTMLButtonElement | null)[]>
  tabContainerRef: RefObject<HTMLDivElement>
  onSelect: (filter: CardGridFilter) => void
}

function focusTab(index: number, tabButtonRefs: MutableRefObject<(HTMLButtonElement | null)[]>) {
  tabButtonRefs.current[index]?.focus()
}

export default function CardGridTabs({
  filter,
  indicator,
  indicatorReady,
  indicatorStyle,
  tabButtonRefs,
  tabContainerRef,
  onSelect,
}: Props) {
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
    focusTab(nextIndex, tabButtonRefs)
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2 min-[640px]:mb-5">
      <div
        ref={tabContainerRef}
        role="tablist"
        aria-label="Filter work"
        className="relative inline-flex rounded-md border border-bg3 bg-bg2 p-1"
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute z-0 rounded-md bg-bg0 shadow-sm motion-reduce:hidden',
            indicatorReady && indicator.width > 0 ? 'opacity-100' : 'opacity-0',
          )}
          style={indicatorStyle}
        />
        {TAB_OPTIONS.map(({ id, label }, index) => {
          const selected = filter === id

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
              aria-controls={selected ? `tabpanel-${id}` : undefined}
              tabIndex={selected ? 0 : -1}
              className={cn(tabButtonBase, selected ? 'text-fg0' : 'text-fg3 hover:text-fg1')}
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
