import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  cardAnimMs,
  cardExitAnimMs,
  cardInitialStaggerCap,
} from '@/components/card-grid/constants'
import { mergeRowsForFilter } from '@/components/card-grid/mergeRows'
import {
  enterRowsFor,
  itemKey,
  rowsForItems,
  sortedItemsForFilter,
  type GridRow,
} from '@/components/card-grid/model'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'

function phaseBatch(
  rows: GridRow[],
  phase: 'enter' | 'exit',
  durationMs: number,
  delayOf: (row: GridRow) => number,
) {
  const matched = rows.filter((row) => row.phase === phase)
  if (matched.length === 0) {
    return null
  }

  return {
    signature: matched
      .map((row) => itemKey(row.item))
      .sort()
      .join('\0'),
    maxEndMs: Math.max(...matched.map((row) => delayOf(row) + durationMs), durationMs),
  }
}

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
  const wantedSorted = useMemo(() => sortedItemsForFilter(items, filter), [items, filter])
  const prevWantedRef = useRef(wantedSorted)

  useLayoutEffect(() => {
    if (!ready || !reducedMotion) {
      return
    }

    setRows(rowsForItems(wantedSorted, 'stay'))
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
    () => phaseBatch(rows, 'enter', cardAnimMs, (row) => row.enterDelayMs ?? 0),
    [rows],
  )
  const enterBatchSignature = enterBatch?.signature ?? ''
  const enterBatchMaxEndMs = enterBatch?.maxEndMs ?? 0

  const exitBatch = useMemo(
    () => phaseBatch(rows, 'exit', cardExitAnimMs, (row) => row.exitDelayMs ?? 0),
    [rows],
  )
  const exitBatchSignature = exitBatch?.signature ?? ''
  const exitBatchMaxEndMs = exitBatch?.maxEndMs ?? 0

  useEffect(() => {
    if (!enterBatchSignature) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setRows((previous) =>
        previous.map((row) =>
          row.phase === 'enter' ? { item: row.item, phase: 'stay' as const } : row,
        ),
      )
    }, enterBatchMaxEndMs)

    return () => window.clearTimeout(timeoutId)
  }, [enterBatchSignature, enterBatchMaxEndMs])

  useEffect(() => {
    if (!exitBatchSignature) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setRows((previous) => previous.filter((row) => row.phase !== 'exit'))
    }, exitBatchMaxEndMs)

    return () => window.clearTimeout(timeoutId)
  }, [exitBatchSignature, exitBatchMaxEndMs])

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

  return {
    activeRows,
    exitRows,
    filter,
    selectFilter: setFilter,
  }
}
