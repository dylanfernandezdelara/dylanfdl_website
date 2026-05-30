'use client'

import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { cardExitAnimMs, cardExitStaggerMs, cardStaggerMs } from '@/components/card-grid/constants'
import {
  itemKey,
  rowsForItems,
  sortedItemsForFilter,
  type GridRow,
} from '@/components/card-grid/model'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'

function shouldRestartEnterSequence(prev: GridRow[], wantedSorted: CardGridSerializableItem[]): boolean {
  const activePrev = prev.filter((row) => row.phase !== 'exit')
  if (activePrev.length === 0 || wantedSorted.length === 0) {
    return false
  }

  const activeKeys = new Set(activePrev.map((row) => itemKey(row.item)))
  const wantedKeys = new Set(wantedSorted.map(itemKey))
  const activeStillWanted = activePrev.every((row) => wantedKeys.has(itemKey(row.item)))
  const hasOverlap = activePrev.some((row) => wantedKeys.has(itemKey(row.item)))

  return !hasOverlap || (activeStillWanted && wantedKeys.size > activeKeys.size)
}

function mergeRowsForFilter(prev: GridRow[], wantedSorted: CardGridSerializableItem[]): GridRow[] {
  if (shouldRestartEnterSequence(prev, wantedSorted)) {
    return rowsForItems(wantedSorted, 'enter', (index) => ({
      enterDelayMs: index * cardStaggerMs,
    }))
  }

  const wantedByKey = new Map(wantedSorted.map((item) => [itemKey(item), item]))
  const prevByKey = new Map(prev.map((row) => [itemKey(row.item), row]))
  const active: GridRow[] = []
  let newEnterSlot = 0

  for (const item of wantedSorted) {
    const previous = prevByKey.get(itemKey(item))

    if (!previous || previous.phase === 'exit') {
      active.push({
        item,
        phase: 'enter',
        enterDelayMs: newEnterSlot++ * cardStaggerMs,
      })
    } else if (previous.phase === 'enter') {
      active.push({
        item,
        phase: 'enter',
        enterDelayMs: previous.enterDelayMs ?? 0,
      })
    } else {
      active.push({ item, phase: 'stay' })
    }
  }

  const exiting: GridRow[] = []
  let newExitSlot = 0

  for (const row of prev) {
    const key = itemKey(row.item)
    if (wantedByKey.has(key)) {
      continue
    }

    exiting.push(
      row.phase === 'exit'
        ? row
        : {
            item: row.item,
            phase: 'exit',
            exitDelayMs: newExitSlot++ * cardExitStaggerMs,
          }
    )
  }

  return [...active, ...exiting]
}

export default function useCardGridRows(items: CardGridSerializableItem[]) {
  const [filter, setFilter] = useState<CardGridFilter>('all')
  const reducedMotion = usePrefersReducedMotion()
  const [rows, setRows] = useState<GridRow[]>(() =>
    rowsForItems(sortedItemsForFilter(items, 'all'), 'enter', (index) => ({
      enterDelayMs: Math.min(index, 12) * cardStaggerMs,
    }))
  )

  const wantedSorted = useMemo(() => sortedItemsForFilter(items, filter), [items, filter])

  useLayoutEffect(() => {
    if (reducedMotion) {
      setRows(rowsForItems(wantedSorted, 'stay'))
      return
    }

    setRows((previous) => mergeRowsForFilter(previous, wantedSorted))
  }, [wantedSorted, reducedMotion])

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
