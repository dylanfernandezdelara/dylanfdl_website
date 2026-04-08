'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type AnimationEvent,
  type ReactNode,
} from 'react'

import Card from '@/components/Card'
import EditorThumbnail from '@/components/EditorThumbnail'
import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

const TAB_OPTIONS: { id: CardGridFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects' },
  { id: 'music', label: 'Music' },
]

/** Smooth ease — gentler than a hard “snap” ease-out */
const smoothEase = 'cubic-bezier(0.4, 0, 0.2, 1)'
const tabTransitionMs = 450
const cardStaggerMs = 64
const cardAnimMs = 520
/** Shorter exits so the footer reaches its final layout sooner (no flow-collapsing tricks — avoids overlapping cards). */
const cardExitAnimMs = 300
const cardExitStaggerMs = 24

function itemKey(item: CardGridSerializableItem): string {
  return item.href
}

function itemMatchesFilter(item: CardGridSerializableItem, filter: CardGridFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'projects':
      return item.category === 'projects'
    case 'music':
      return item.category === 'music'
    default: {
      const _exhaustive: never = filter
      return _exhaustive
    }
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

const tabButtonBase =
  'relative z-10 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

type TabIndicator = {
  left: number
  top: number
  width: number
  height: number
}

type RowPhase = 'enter' | 'stay' | 'exit'

/** Delays are fixed when a phase starts so they never change mid-animation (avoids judder). */
type GridRow = {
  item: CardGridSerializableItem
  phase: RowPhase
  enterDelayMs?: number
  exitDelayMs?: number
}

type Props = {
  items: CardGridSerializableItem[]
  /** Rendered in document flow immediately after the filtered (non-exiting) grid so it is not pushed down by exit animations. */
  footer?: ReactNode
}

const gridMediaQuery = '(min-width: 640px)'

function subscribeGridCols(callback: () => void) {
  const mq = window.matchMedia(gridMediaQuery)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getGridColsSnapshot(): 1 | 2 {
  return window.matchMedia(gridMediaQuery).matches ? 2 : 1
}

function getGridColsServerSnapshot(): 1 | 2 {
  return 2
}

function gridPlacementStyle(index: number, cols: 1 | 2): { gridColumn: number; gridRow: number } {
  const c = cols
  return {
    gridColumn: (index % c) + 1,
    gridRow: Math.floor(index / c) + 1,
  }
}

/**
 * Music ↔ Projects are disjoint (artifacts vs essays). Cross-switching used to prepend/append
 * `enter` + `exit` rows so the grid reflowed: every music card jumped to new cells for one beat.
 * Hard-cut to the new set keeps a single stable layout for that transition.
 */
function isDisjointProjectsMusicSwitch(
  prev: GridRow[],
  wantedSorted: CardGridSerializableItem[],
): boolean {
  if (prev.length === 0 || wantedSorted.length === 0) {
    return false
  }
  const prevCats = new Set(prev.map((r) => r.item.category))
  const wantCats = new Set(wantedSorted.map((i) => i.category))
  if (prevCats.size !== 1 || wantCats.size !== 1) {
    return false
  }
  const prevCat = prevCats.values().next().value
  const wantCat = wantCats.values().next().value
  return (
    (prevCat === 'music' && wantCat === 'projects') ||
    (prevCat === 'projects' && wantCat === 'music')
  )
}

/**
 * Music-only or Projects-only → All: visible cards were all `stay`; merge would only `enter` the
 * missing category so one group animates and the other does not. Re-stagger everyone for a uniform enter.
 */
function isSingleCategoryViewExpandingToAll(
  prev: GridRow[],
  wantedSorted: CardGridSerializableItem[],
): boolean {
  const activePrev = prev.filter((r) => r.phase !== 'exit')
  if (activePrev.length === 0) {
    return false
  }
  const cats = new Set(activePrev.map((r) => r.item.category))
  if (cats.size !== 1) {
    return false
  }
  const only = cats.values().next().value
  const wantCats = new Set(wantedSorted.map((i) => i.category))
  if (wantCats.size < 2) {
    return false
  }
  return only === 'music' || only === 'projects'
}

/**
 * Merge previous rows with the new filter’s list.
 *
 * Active (stay/enter) rows follow `wantedSorted` order so the grid matches the target filter
 * immediately. Exiting rows are appended after them — otherwise a global date sort puts the
 * newest *exiting* card first and shoves real results (e.g. Stravinsky) into the wrong cell until
 * the exit is pruned.
 */
function mergeRowsForFilter(
  prev: GridRow[],
  wantedSorted: CardGridSerializableItem[],
): GridRow[] {
  if (isDisjointProjectsMusicSwitch(prev, wantedSorted)) {
    return wantedSorted.map((item, i) => ({
      item,
      phase: 'enter' as const,
      enterDelayMs: i * cardStaggerMs,
    }))
  }

  if (isSingleCategoryViewExpandingToAll(prev, wantedSorted)) {
    return wantedSorted.map((item, i) => ({
      item,
      phase: 'enter' as const,
      enterDelayMs: i * cardStaggerMs,
    }))
  }

  const wantedByKey = new Map(wantedSorted.map((i) => [itemKey(i), i]))
  const prevByKey = new Map(prev.map((r) => [itemKey(r.item), r]))

  const active: GridRow[] = []
  let newEnterSlot = 0

  for (const item of wantedSorted) {
    const k = itemKey(item)
    const prevRow = prevByKey.get(k)
    if (!prevRow) {
      active.push({
        item,
        phase: 'enter',
        enterDelayMs: newEnterSlot++ * cardStaggerMs,
      })
      continue
    }
    if (prevRow.phase === 'exit') {
      active.push({
        item,
        phase: 'enter',
        enterDelayMs: newEnterSlot++ * cardStaggerMs,
      })
    } else if (prevRow.phase === 'enter') {
      active.push({
        item,
        phase: 'enter',
        enterDelayMs: prevRow.enterDelayMs ?? 0,
      })
    } else {
      active.push({ item, phase: 'stay' })
    }
  }

  const exiting: GridRow[] = []
  let newExitSlot = 0
  for (const row of prev) {
    const k = itemKey(row.item)
    if (wantedByKey.has(k)) {
      continue
    }
    if (row.phase === 'exit') {
      exiting.push(row)
    } else {
      exiting.push({
        item: row.item,
        phase: 'exit',
        exitDelayMs: newExitSlot++ * cardExitStaggerMs,
      })
    }
  }

  return [...active, ...exiting]
}

export default function CardGridClient({ items, footer }: Props) {
  const [filter, setFilter] = useState<CardGridFilter>('all')
  const reducedMotion = usePrefersReducedMotion()
  const gridCols = useSyncExternalStore(subscribeGridCols, getGridColsSnapshot, getGridColsServerSnapshot)

  const itemsKey = useMemo(
    () =>
      items
        .map((i) => itemKey(i))
        .sort()
        .join('\0'),
    [items],
  )

  const [rows, setRows] = useState<GridRow[]>(() =>
    items
      .filter((i) => itemMatchesFilter(i, 'all'))
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
      .map((item, i) => ({
        item,
        phase: 'enter' as const,
        enterDelayMs: Math.min(i, 12) * cardStaggerMs,
      })),
  )

  const itemsRef = useRef(items)
  itemsRef.current = items

  /** useLayoutEffect: avoid one painted frame where the tab matches the new filter but `rows` still reflect the previous order (e.g. essay still first → Stravinsky looks like it “jumps” to slot 1). */
  useLayoutEffect(() => {
    const source = itemsRef.current
    const wantedSorted = source
      .filter((i) => itemMatchesFilter(i, filter))
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))

    if (reducedMotion) {
      setRows(wantedSorted.map((item) => ({ item, phase: 'stay' as const })))
      return
    }

    setRows((prev) => mergeRowsForFilter(prev, wantedSorted))
  }, [filter, itemsKey, reducedMotion])

  /** One reflow when exits finish — per-card removal was stepping the footer up repeatedly. */
  const exitBatch = useMemo(() => {
    const exiting = rows.filter((r) => r.phase === 'exit')
    if (exiting.length === 0) {
      return null
    }
    const maxEndMs = Math.max(
      ...exiting.map((r) => (r.exitDelayMs ?? 0) + cardExitAnimMs),
      cardExitAnimMs,
    )
    const signature = exiting
      .map((r) => itemKey(r.item))
      .sort()
      .join('\0')
    return { maxEndMs, signature }
  }, [rows])

  useEffect(() => {
    if (!exitBatch) {
      return
    }
    const t = window.setTimeout(() => {
      setRows((prev) => prev.filter((r) => r.phase !== 'exit'))
    }, exitBatch.maxEndMs)
    return () => window.clearTimeout(t)
  }, [exitBatch?.signature, exitBatch?.maxEndMs])

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

    /** Coalesce rapid window resize events so the pill doesn’t thrash. */
    function scheduleMeasure() {
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current)
      }
      measureRafRef.current = requestAnimationFrame(() => {
        measureRafRef.current = null
        measureNow()
      })
    }

    measureNow()

    window.addEventListener('resize', scheduleMeasure)
    return () => {
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current)
        measureRafRef.current = null
      }
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [filter])

  function handleRowAnimationEnd(event: AnimationEvent<HTMLDivElement>, href: string) {
    if (event.target !== event.currentTarget) {
      return
    }
    const name = event.animationName

    if (name.includes('enter')) {
      setRows((prev) =>
        prev.map((r) =>
          itemKey(r.item) === href && r.phase === 'enter'
            ? { item: r.item, phase: 'stay' }
            : r,
        ),
      )
    }
  }

  const { activeRows, exitRows } = useMemo(() => {
    const active: GridRow[] = []
    const exiting: GridRow[] = []
    for (const r of rows) {
      if (r.phase === 'exit') {
        exiting.push(r)
      } else {
        active.push(r)
      }
    }
    return { activeRows: active, exitRows: exiting }
  }, [rows])

  function renderPlacedRow(row: GridRow, placementIndex: number) {
    const href = itemKey(row.item)
    const enterStagger = row.enterDelayMs ?? 0
    const exitStagger = row.exitDelayMs ?? 0
    const place = gridPlacementStyle(placementIndex, gridCols)

    const wrapperClass = cn(
      row.phase === 'enter' &&
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none',
      row.phase === 'exit' &&
        'animate-out fade-out slide-out-to-bottom-2 fill-mode-forwards motion-reduce:animate-none motion-reduce:opacity-0 motion-reduce:transform-none',
      row.phase === 'stay' && 'opacity-100',
      row.phase !== 'stay' &&
        'will-change-[transform,opacity] [backface-visibility:hidden] [transform:translateZ(0)]',
    )

    const animStyle =
      row.phase === 'enter'
        ? {
            animationDelay: `${enterStagger}ms`,
            animationDuration: `${cardAnimMs}ms`,
            animationTimingFunction: smoothEase,
          }
        : row.phase === 'exit'
          ? {
              animationDelay: `${exitStagger}ms`,
              animationDuration: `${cardExitAnimMs}ms`,
              animationTimingFunction: smoothEase,
            }
          : undefined

    const mergedStyle = animStyle !== undefined ? { ...place, ...animStyle } : place

    return row.item.kind === 'artifact' ? (
      <div
        key={href}
        className={wrapperClass}
        style={mergedStyle}
        onAnimationEnd={(e) => handleRowAnimationEnd(e, href)}
        aria-hidden={row.phase === 'exit'}
      >
        <div className={row.phase === 'exit' ? 'pointer-events-none' : undefined}>
          <Card
            title={row.item.title}
            dateLabel={row.item.dateLabel}
            href={row.item.href}
            external
            videoSrc={row.item.videoSrc}
            posterSrc={row.item.posterSrc}
          />
        </div>
      </div>
    ) : (
      <div
        key={href}
        className={wrapperClass}
        style={mergedStyle}
        onAnimationEnd={(e) => handleRowAnimationEnd(e, href)}
        aria-hidden={row.phase === 'exit'}
      >
        <div className={row.phase === 'exit' ? 'pointer-events-none' : undefined}>
          <Card
            title={row.item.title}
            dateLabel={row.item.dateLabel}
            href={row.item.href}
            videoSrc={row.item.videoSrc}
            posterSrc={row.item.posterSrc}
            thumbnail={row.item.slug === 'purpose-of-writing' ? <EditorThumbnail /> : undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div
        className="mb-4 flex flex-wrap gap-2 min-[640px]:mb-5"
        role="tablist"
        aria-label="Filter work"
      >
        <div
          ref={tabContainerRef}
          className="relative inline-flex rounded-md border border-bg3 bg-bg2 p-1"
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute z-0 rounded-md bg-bg0 shadow-sm motion-reduce:hidden',
              indicatorReady && indicator.width > 0 ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              left: indicator.left,
              top: indicator.top,
              width: indicator.width,
              height: indicator.height,
              transitionProperty: 'left, top, width, height, opacity',
              transitionDuration: `${tabTransitionMs}ms`,
              transitionTimingFunction: smoothEase,
            }}
          />
          {TAB_OPTIONS.map(({ id, label }, index) => {
            const selected = filter === id
            return (
              <button
                key={id}
                ref={(el) => {
                  tabButtonRefs.current[index] = el
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn(
                  tabButtonBase,
                  selected ? 'text-fg0' : 'text-fg3 hover:text-fg1',
                )}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative">
        <div className="grid auto-rows-auto grid-cols-1 gap-3 min-[640px]:grid-cols-2 md:gap-4">
          {activeRows.map((row, i) => renderPlacedRow(row, i))}
        </div>
        {footer != null ? <div className="relative z-20">{footer}</div> : null}
        {exitRows.length > 0 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 grid auto-rows-auto grid-cols-1 gap-3 min-[640px]:grid-cols-2 md:gap-4"
          >
            {exitRows.map((row, j) => renderPlacedRow(row, activeRows.length + j))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
