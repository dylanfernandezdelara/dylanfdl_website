import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  cardAnimMs,
  cardExitAnimMs,
  cardInitialStaggerCap,
} from '@/components/card-grid/constants'
import { mergeRowsForFilter } from '@/components/card-grid/mergeRows'
import {
  enterRowsFor,
  rowsForItems,
  sortedItemsForFilter,
  type GridRow,
} from '@/components/card-grid/model'
import { batchForPhase, usePhaseBatchTimeout } from '@/components/card-grid/phaseBatch'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'

export default function useCardGridRows(items: CardGridSerializableItem[]) {
  const [filter, setFilter] = useState<CardGridFilter>('all')
  const { reduced: reducedMotion, ready } = usePrefersReducedMotion()
  /**
   * Start in `enter` so SSR HTML already carries the keyframed classes.
   * Animations begin on first paint (not after hydration), which removes the
   * visible → opacity-0 snap that read as judder on cold mobile loads.
   */
  const [rows, setRows] = useState<GridRow[]>(() =>
    enterRowsFor(sortedItemsForFilter(items, 'all'), {
      staggerCap: cardInitialStaggerCap,
    }),
  )
  /** One-way latch: unlock video decode after the initial enter (or reduced motion). */
  const [mediaEnabled, setMediaEnabled] = useState(false)
  const wantedSorted = useMemo(() => sortedItemsForFilter(items, filter), [items, filter])
  const prevWantedRef = useRef(wantedSorted)

  useLayoutEffect(() => {
    if (!ready || !reducedMotion) {
      return
    }

    setRows(rowsForItems(wantedSorted, 'stay'))
    setMediaEnabled(true)
  }, [ready, reducedMotion, wantedSorted])

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    if (prevWantedRef.current === wantedSorted) {
      return
    }

    prevWantedRef.current = wantedSorted
    setRows((previous) => mergeRowsForFilter(previous, wantedSorted))
  }, [wantedSorted, reducedMotion])

  const enterBatch = useMemo(
    () => batchForPhase(rows, 'enter', cardAnimMs, (row) => row.enterDelayMs ?? 0),
    [rows],
  )
  const exitBatch = useMemo(
    () => batchForPhase(rows, 'exit', cardExitAnimMs, (row) => row.exitDelayMs ?? 0),
    [rows],
  )

  usePhaseBatchTimeout(enterBatch, () => {
    setRows((previous) =>
      previous.map((row) =>
        row.phase === 'enter' ? { item: row.item, phase: 'stay' as const } : row,
      ),
    )
    setMediaEnabled(true)
  })

  usePhaseBatchTimeout(exitBatch, () => {
    setRows((previous) => previous.filter((row) => row.phase !== 'exit'))
  })

  const { activeRows, exitRows } = useMemo(() => {
    const active: GridRow[] = []
    const exiting: GridRow[] = []

    for (const row of rows) {
      if (row.phase === 'exit') {
        exiting.push(row)
      } else {
        active.push(row)
      }
    }

    return { activeRows: active, exitRows: exiting }
  }, [rows])

  const layoutLocked =
    exitRows.length > 0 || activeRows.some((row) => row.phase !== 'stay')

  return {
    activeRows,
    exitRows,
    filter,
    layoutLocked,
    mediaEnabled,
    selectFilter: setFilter,
  }
}
