'use client'

import type { CSSProperties, MutableRefObject, RefObject } from 'react'

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

export default function CardGridTabs({
  filter,
  indicator,
  indicatorReady,
  indicatorStyle,
  tabButtonRefs,
  tabContainerRef,
  onSelect,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 min-[640px]:mb-5" role="tablist" aria-label="Filter work">
      <div ref={tabContainerRef} className="relative inline-flex rounded-md border border-bg3 bg-bg2 p-1">
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute z-0 rounded-md bg-bg0 shadow-sm motion-reduce:hidden',
            indicatorReady && indicator.width > 0 ? 'opacity-100' : 'opacity-0'
          )}
          style={indicatorStyle}
        />
        {TAB_OPTIONS.map(({ id, label }, index) => {
          const selected = filter === id

          return (
            <button
              key={id}
              ref={(element) => {
                tabButtonRefs.current[index] = element
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(tabButtonBase, selected ? 'text-fg0' : 'text-fg3 hover:text-fg1')}
              onClick={() => onSelect(id)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
