import type { KeyboardEvent, MutableRefObject } from 'react'

import { TAB_OPTIONS } from '@/components/card-grid/constants'
import type { CardGridFilter } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

const tabButtonBase =
  'relative z-10 rounded-md px-2.5 py-1.5 text-sm font-medium leading-none transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

type Props = {
  filter: CardGridFilter
  tabButtonRefs: MutableRefObject<(HTMLButtonElement | null)[]>
  onSelect: (filter: CardGridFilter) => void
}

function focusTab(index: number, tabButtonRefs: MutableRefObject<(HTMLButtonElement | null)[]>) {
  tabButtonRefs.current[index]?.focus()
}

export default function CardGridTabs({ filter, tabButtonRefs, onSelect }: Props) {
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
      <div role="tablist" aria-label="Filter work" className="relative inline-flex rounded-md border border-bg3 bg-bg2 p-0.5">
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
              aria-controls={selected ? 'tabpanel-work' : undefined}
              tabIndex={selected ? 0 : -1}
              className={cn(
                tabButtonBase,
                selected ? 'bg-bg0 text-fg0 shadow-sm' : 'text-fg3 hover:text-fg1',
              )}
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
