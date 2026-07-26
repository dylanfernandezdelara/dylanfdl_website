'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

import { TAB_OPTIONS, smoothEase, tabTransitionMs } from '@/components/card-grid/constants'
import type { CardGridFilter } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

const tabButtonBase =
  'relative z-10 rounded-md px-2.5 py-1.5 text-sm font-medium leading-none transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

type TabIndicator = {
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
  const [indicator, setIndicator] = useState<TabIndicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })
  const [indicatorReady, setIndicatorReady] = useState(false)
  // Transitions stay off until after the first measured paint so Home remount
  // does not grow the pill from 0×0 over the All tab.
  const [indicatorCanAnimate, setIndicatorCanAnimate] = useState(false)

  useLayoutEffect(() => {
    function measureNow() {
      const container = tabContainerRef.current
      const idx = TAB_OPTIONS.findIndex((t) => t.id === filter)
      const btn = tabButtonRefs.current[idx]
      if (!container || !btn) {
        return
      }
      setIndicator({
        left: btn.offsetLeft,
        top: btn.offsetTop,
        width: btn.offsetWidth,
        height: btn.offsetHeight,
      })
      setIndicatorReady(true)
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
    if (!indicatorReady || indicatorCanAnimate) {
      return
    }
    setIndicatorCanAnimate(true)
  }, [indicatorReady, indicatorCanAnimate])

  const indicatorStyle = useMemo(
    () => ({
      left: indicator.left,
      top: indicator.top,
      width: indicator.width,
      height: indicator.height,
      transitionProperty: indicatorCanAnimate ? 'left, top, width, height' : 'none',
      transitionDuration: `${tabTransitionMs}ms`,
      transitionTimingFunction: smoothEase,
    }),
    [indicator, indicatorCanAnimate],
  )

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
        {indicatorReady && indicator.width > 0 ? (
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
                  ? cn(
                      'text-fg0',
                      // Static chrome until the sliding pill mounts (SSR / first measure).
                      (!indicatorReady || indicator.width === 0) && 'bg-bg0 shadow-sm',
                      'motion-reduce:bg-bg0 motion-reduce:shadow-sm',
                    )
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
