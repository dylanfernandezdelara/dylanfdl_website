import { cardExitStaggerMs, cardStaggerMs } from '@/components/card-grid/constants'
import {
  enterRowsFor,
  itemKey,
  type GridRow,
} from '@/components/card-grid/model'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

export function shouldRestartEnterSequence(prev: GridRow[], wantedSorted: CardGridSerializableItem[]): boolean {
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

export function mergeRowsForFilter(prev: GridRow[], wantedSorted: CardGridSerializableItem[]): GridRow[] {
  if (shouldRestartEnterSequence(prev, wantedSorted)) {
    return enterRowsFor(wantedSorted)
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
          },
    )
  }

  return [...active, ...exiting]
}
