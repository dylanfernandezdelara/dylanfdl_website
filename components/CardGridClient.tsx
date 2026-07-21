'use client'

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import CardGridColumns from '@/components/card-grid/CardGridColumns'
import CardGridTabs from '@/components/card-grid/CardGridTabs'
import { smoothEase, TAB_OPTIONS, tabTransitionMs } from '@/components/card-grid/constants'
import useCardGridRows from '@/components/card-grid/useCardGridRows'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

type TabIndicator = {
  left: number
  top: number
  width: number
  height: number
}

type Props = {
  items: CardGridSerializableItem[]
  children?: ReactNode
}

export default function CardGridClient({ items, children }: Props) {
  const { activeRows, exitRows, filter, markRowEntered, selectFilter } = useCardGridRows(items)
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

  useLayoutEffect(() => {
    function measureNow() {
      const container = tabContainerRef.current
      const idx = TAB_OPTIONS.findIndex((t) => t.id === filter)
      const btn = tabButtonRefs.current[idx]
      if (!container || !btn) {
        return
      }
      const c = container.getBoundingClientRect()
      const b = btn.getBoundingClientRect()
      setIndicator({
        left: b.left - c.left,
        top: b.top - c.top,
        width: b.width,
        height: b.height,
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

  const indicatorStyle = useMemo(
    () => ({
      left: indicator.left,
      top: indicator.top,
      width: indicator.width,
      height: indicator.height,
      transitionProperty: 'left, top, width, height, opacity',
      transitionDuration: `${tabTransitionMs}ms`,
      transitionTimingFunction: smoothEase,
    }),
    [indicator]
  )

  return (
    <div className="mt-8">
      <CardGridTabs
        filter={filter}
        indicator={indicator}
        indicatorReady={indicatorReady}
        indicatorStyle={indicatorStyle}
        tabButtonRefs={tabButtonRefs}
        tabContainerRef={tabContainerRef}
        onSelect={selectFilter}
      />

      <div
        className="relative"
        role="tabpanel"
        id="tabpanel-work"
        aria-labelledby={`tab-${filter}`}
      >
        <div className="relative z-20">
          <CardGridColumns rows={activeRows} onRowEntered={markRowEntered} />
        </div>
        {children != null ? <div className="relative z-20">{children}</div> : null}
        {exitRows.length > 0 ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns rows={exitRows} onRowEntered={markRowEntered} showDesktop={false} />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns
                rows={exitRows}
                columnOffset={activeRows.length}
                onRowEntered={markRowEntered}
                showMobile={false}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
