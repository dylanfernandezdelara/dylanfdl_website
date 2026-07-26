import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  cardAnimMs,
  cardEnterBatchMs,
  cardExitAnimMs,
  cardInitialStaggerCap,
  cardStaggerMs,
} from '@/components/card-grid/constants'
import { mergeRowsForFilter } from '@/components/card-grid/mergeRows'
import {
  itemKey,
  rowsForItems,
  sortedItemsForFilter,
  type GridRow,
} from '@/components/card-grid/model'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'

function initialEnterRows(items: CardGridSerializableItem[]): GridRow[] {
  return rowsForItems(sortedItemsForFilter(items, 'all'), 'enter', (index) => ({
    enterDelayMs: Math.min(index, cardInitialStaggerCap) * cardStaggerMs,
  }))
}

function enterBatchFromRows(rows: GridRow[]) {
  const entering = rows.filter((row) => row.phase === 'enter')
  if (entering.length === 0) {
    return null
  }

  const maxEndMs = Math.max(
    ...entering.map((row) => (row.enterDelayMs ?? 0) + cardAnimMs),
    cardAnimMs,
  )
  const signature = entering
    .map((row) => itemKey(row.item))
    .sort()
    .join('\0')

  return { maxEndMs, signature }
}

export default function useCardGridRows(items: CardGridSerializableItem[]) {
  const [filter, setFilter] = useState<CardGridFilter>('all')
  const { reduced: reducedMotion, ready } = usePrefersReducedMotion()
  /**
   * Start in `enter` so SSR HTML already carries the keyframed classes.
   * Animations begin on first paint (not after hydration), which removes the
   * visible → opacity-0 snap that read as judder on cold mobile loads.
   */
  const [rows, setRows] = useState<GridRow[]>(() => initialEnterRows(items))
  const skipFilterMergeRef = useRef(true)
  const [mediaEnabled, setMediaEnabled] = useState(false)

  const wantedSorted = useMemo(() => sortedItemsForFilter(items, filter), [items, filter])

  useLayoutEffect(() => {
    if (!ready) {
      return
    }

    if (reducedMotion) {
      skipFilterMergeRef.current = false
      setRows(rowsForItems(wantedSorted, 'stay'))
      setMediaEnabled(true)
      return
    }

    if (skipFilterMergeRef.current) {
      skipFilterMergeRef.current = false
      return
    }

    setRows((previous) => mergeRowsForFilter(previous, wantedSorted))
  }, [wantedSorted, reducedMotion, ready])

  const enterBatch = useMemo(() => enterBatchFromRows(rows), [rows])
  const enterBatchSignature = enterBatch?.signature ?? ''
  const enterBatchMaxEndMs = enterBatch?.maxEndMs ?? 0

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
      setMediaEnabled(true)
    }, enterBatchMaxEndMs)

    return () => window.clearTimeout(timeoutId)
  }, [enterBatchSignature, enterBatchMaxEndMs])

  useEffect(() => {
    if (mediaEnabled || !ready) {
      return
    }

    // Safety: if enter never armed (or completed before hydration), unlock media.
    const timeoutId = window.setTimeout(() => {
      setMediaEnabled(true)
    }, cardEnterBatchMs(items.length) + 50)

    return () => window.clearTimeout(timeoutId)
  }, [mediaEnabled, ready, items.length])

  const exitBatch = useMemo(() => {
    const exiting = rows.filter((row) => row.phase === 'exit')
    if (exiting.length === 0) {
      return null
    }

    const maxEndMs = Math.max(
      ...exiting.map((row) => (row.exitDelayMs ?? 0) + cardExitAnimMs),
      cardExitAnimMs,
    )
    const signature = exiting
      .map((row) => itemKey(row.item))
      .sort()
      .join('\0')

    return { maxEndMs, signature }
  }, [rows])
  const exitBatchSignature = exitBatch?.signature ?? ''
  const exitBatchMaxEndMs = exitBatch?.maxEndMs ?? 0

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
    mediaEnabled,
    selectFilter: setFilter,
  }
}
