'use client'

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

import { TAB_OPTIONS, smoothEase, tabTransitionMs } from '@/components/card-grid/constants'
import type { CardGridFilter } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

const tabButtonBase =
  'relative z-10 rounded-md px-2.5 py-1.5 text-sm font-medium leading-none transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

type TabIndicatorBox = {
  left: number
  top: number
  width: number
  height: number
}

type Props = {
  filter: CardGridFilter
  onSelect: (filter: CardGridFilter) => void
}

export default function CardGridTabs({ filter, onSelect }: Props) {
  const tabContainerRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const measureRafRef = useRef<number | null>(null)
  const [box, setBox] = useState<TabIndicatorBox | null>(null)
  // Transitions stay off until after the first measured paint so Home remount
  // does not grow the pill from 0×0 over the All tab.
  const [live, setLive] = useState(false)

  useLayoutEffect(() => {
    function measureNow() {
      const idx = TAB_OPTIONS.findIndex((t) => t.id === filter)
      const btn = tabButtonRefs.current[idx]
      if (!tabContainerRef.current || !btn) {
        return
      }
      setBox({
        left: btn.offsetLeft,
        top: btn.offsetTop,
        width: btn.offsetWidth,
        height: btn.offsetHeight,
      })
    }

    function scheduleCoalescedTabIndicatorMeasure() {
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current)
      }
      measureRafRef.current = requestAnimationFrame(() => {
        measureRafRef.current = null
        measureNow()
      })
    }

    measureNow()

    window.addEventListener('resize', scheduleCoalescedTabIndicatorMeasure)
    return () => {
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current)
        measureRafRef.current = null
      }
      window.removeEventListener('resize', scheduleCoalescedTabIndicatorMeasure)
    }
  }, [filter])

  useEffect(() => {
    if (!box || live) {
      return
    }
    setLive(true)
  }, [box, live])

  const showPill = box !== null && box.width > 0
  const indicatorStyle = box
    ? {
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        transitionProperty: live ? 'left, top, width, height' : 'none',
        transitionDuration: `${tabTransitionMs}ms`,
        transitionTimingFunction: smoothEase,
      }
    : undefined

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
    <div className="mb-4 flex flex-wrap gap-2 min-[640px]:mb-5">
      <div
        ref={tabContainerRef}
        role="tablist"
        aria-label="Filter work"
        className="relative inline-flex rounded-md border border-bg3 bg-bg2 p-0.5"
      >
        {showPill ? (
          <span
            aria-hidden
            className="pointer-events-none absolute z-0 rounded-md bg-bg0 shadow-sm motion-reduce:hidden"
            style={indicatorStyle}
          />
        ) : null}
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
                selected
                  ? showPill
                    ? 'text-fg0 motion-reduce:bg-bg0 motion-reduce:shadow-sm'
                    : 'bg-bg0 text-fg0 shadow-sm'
                  : 'text-fg3 hover:text-fg1',
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
