'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type RefObject,
} from 'react'

import { smoothEase, tabTransitionMs, type TabOption } from '@/components/card-grid/constants'
import type { CardGridFilter } from '@/lib/buildCardGridItems'

type TabIndicatorBox = {
  left: number
  top: number
  width: number
  height: number
}

export type UseTabIndicatorResult = {
  tablistRef: RefObject<HTMLDivElement | null>
  tabButtonRefs: MutableRefObject<(HTMLButtonElement | null)[]>
  showPill: boolean
  indicatorStyle: CSSProperties | undefined
}

export default function useTabIndicator(
  filter: CardGridFilter,
  options: readonly TabOption[],
): UseTabIndicatorResult {
  const tablistRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [box, setBox] = useState<TabIndicatorBox | null>(null)
  // Transitions stay off until after the first measured paint so Home remount
  // does not grow the pill from 0×0 over the All tab.
  const [live, setLive] = useState(false)

  useLayoutEffect(() => {
    const tablist = tablistRef.current
    if (!tablist) {
      return undefined
    }

    const measure = () => {
      const idx = options.findIndex((t) => t.id === filter)
      const btn = tabButtonRefs.current[idx]
      if (!btn || btn.offsetWidth <= 0) {
        return
      }
      setBox({
        left: btn.offsetLeft,
        top: btn.offsetTop,
        width: btn.offsetWidth,
        height: btn.offsetHeight,
      })
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(tablist)

    return () => {
      observer.disconnect()
    }
  }, [filter, options])

  useEffect(() => {
    if (box) {
      setLive(true)
    }
  }, [box])

  const showPill = box !== null
  const indicatorStyle: CSSProperties | undefined = box
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

  return {
    tablistRef,
    tabButtonRefs,
    showPill,
    indicatorStyle,
  }
}
