import type { CardGridFilter, CardGridSerializableItem } from '@/lib/buildCardGridItems'

export type RowPhase = 'enter' | 'stay' | 'exit'

export type GridRow = {
  item: CardGridSerializableItem
  phase: RowPhase
  enterDelayMs?: number
  exitDelayMs?: number
}

export function itemKey(item: CardGridSerializableItem): string {
  return item.href
}

export function itemMatchesFilter(item: CardGridSerializableItem, filter: CardGridFilter): boolean {
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

export function sortItemsByDateDesc<T extends { sortDate: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.sortDate.localeCompare(a.sortDate))
}

export function rowsForItems(
  items: CardGridSerializableItem[],
  phase: RowPhase,
  delayForIndex?: (index: number) => Partial<GridRow>
): GridRow[] {
  return items.map((item, index) => ({
    item,
    phase,
    ...(delayForIndex?.(index) ?? {}),
  }))
}

export function sortedItemsForFilter(
  source: CardGridSerializableItem[],
  filter: CardGridFilter
): CardGridSerializableItem[] {
  return sortItemsByDateDesc(source.filter((item) => itemMatchesFilter(item, filter)))
}
