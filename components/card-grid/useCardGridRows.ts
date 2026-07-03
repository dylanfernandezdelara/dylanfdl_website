import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { cardExitAnimMs, cardStaggerMs } from '@/components/card-grid/constants'
import { mergeRowsForFilter } from '@/components/card-grid/mergeRows'
import {
  itemKey,
  rowsForItems,
  sortedItemsForFilter,
  type GridRow,
} from '@/components/card-grid/model'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'

export default function useCardGridRows(items: CardGridSerializableItem[]) {
  const [filter, setFilter] = useState<CardGridFilter>('all')
  const { reduced: reducedMotion, ready } = usePrefersReducedMotion()
  const initialEnterDoneRef = useRef(false)
  const [rows, setRows] = useState<GridRow[]>(() =>
    rowsForItems(sortedItemsForFilter(items, 'all'), 'stay'),
  )

  const wantedSorted = useMemo(() => sortedItemsForFilter(items, filter), [items, filter])

  useLayoutEffect(() => {
    if (!ready) {
      return
    }

    if (reducedMotion) {
      setRows(rowsForItems(wantedSorted, 'stay'))
      return
    }

    if (!initialEnterDoneRef.current) {
      initialEnterDoneRef.current = true
      setRows(
        rowsForItems(wantedSorted, 'enter', (index) => ({
          enterDelayMs: Math.min(index, 12) * cardStaggerMs,
        })),
      )
      return
    }

    setRows((previous) => mergeRowsForFilter(previous, wantedSorted))
  }, [wantedSorted, reducedMotion, ready])

  const exitBatch = useMemo(() => {
    const exiting = rows.filter((row) => row.phase === 'exit')
    if (exiting.length === 0) {
      return null
    }

    const maxEndMs = Math.max(
      ...exiting.map((row) => (row.exitDelayMs ?? 0) + cardExitAnimMs),
      cardExitAnimMs
    )
    const signature = exiting.map((row) => itemKey(row.item)).sort().join('\0')

    return { maxEndMs, signature }
  }, [rows])

  useEffect(() => {
    if (!exitBatch) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setRows((previous) => previous.filter((row) => row.phase !== 'exit'))
    }, exitBatch.maxEndMs)

    return () => window.clearTimeout(timeoutId)
  }, [exitBatch?.signature, exitBatch?.maxEndMs])

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

  const markRowEntered = (href: string) => {
    setRows((previous) =>
      previous.map((row) =>
        itemKey(row.item) === href && row.phase === 'enter'
          ? { item: row.item, phase: 'stay' }
          : row
      )
    )
  }

  return {
    activeRows,
    exitRows,
    filter,
    markRowEntered,
    selectFilter: setFilter,
  }
}
