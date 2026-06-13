import { describe, expect, it } from 'vitest'

import { cardExitStaggerMs, cardStaggerMs } from '../components/card-grid/constants'
import { mergeRowsForFilter, shouldRestartEnterSequence } from '../components/card-grid/mergeRows'
import { itemKey, rowsForItems, type GridRow } from '../components/card-grid/model'
import type { CardGridSerializableItem } from '../lib/buildCardGridItems'

function essay(href: string, title: string): CardGridSerializableItem {
  return {
    kind: 'essay',
    category: 'projects',
    sortDate: '2025-01-01',
    slug: href.replace('/essays/', ''),
    title,
    dateLabel: 'Jan 2025',
    href,
  }
}

function artifact(href: string, title: string): CardGridSerializableItem {
  return {
    kind: 'artifact',
    category: 'music',
    sortDate: '2024-01-01',
    title,
    dateLabel: 'Jan 2024',
    href,
    videoSrc: '/videos/example.mp4',
    posterSrc: '/posters/example.jpg',
  }
}

function asRows(items: CardGridSerializableItem[], phase: GridRow['phase'] = 'stay'): GridRow[] {
  return rowsForItems(items, phase)
}

describe('shouldRestartEnterSequence', () => {
  it('returns false when there is no active previous row', () => {
    const prev = asRows([essay('/essays/a', 'A')], 'exit')
    expect(shouldRestartEnterSequence(prev, [essay('/essays/b', 'B')])).toBe(false)
  })

  it('returns true when active and wanted sets do not overlap', () => {
    const prev = asRows([essay('/essays/a', 'A')])
    expect(shouldRestartEnterSequence(prev, [essay('/essays/b', 'B')])).toBe(true)
  })

  it('returns true when all active rows remain wanted but new rows are added', () => {
    const prev = asRows([essay('/essays/a', 'A')])
    const wanted = [essay('/essays/a', 'A'), essay('/essays/b', 'B')]
    expect(shouldRestartEnterSequence(prev, wanted)).toBe(true)
  })

  it('returns false when the same active set is still wanted', () => {
    const prev = asRows([essay('/essays/a', 'A'), essay('/essays/b', 'B')])
    const wanted = [essay('/essays/a', 'A'), essay('/essays/b', 'B')]
    expect(shouldRestartEnterSequence(prev, wanted)).toBe(false)
  })
})

describe('mergeRowsForFilter', () => {
  it('restarts enter sequence with staggered delays when there is no overlap', () => {
    const prev = asRows([essay('/essays/a', 'A')])
    const wanted = [essay('/essays/b', 'B'), essay('/essays/c', 'C')]

    const merged = mergeRowsForFilter(prev, wanted)

    expect(merged).toEqual([
      { item: wanted[0], phase: 'enter', enterDelayMs: 0 },
      { item: wanted[1], phase: 'enter', enterDelayMs: cardStaggerMs },
    ])
  })

  it('keeps overlapping rows in stay phase without re-entering', () => {
    const prev = asRows([essay('/essays/a', 'A'), essay('/essays/b', 'B')])
    const wanted = [essay('/essays/a', 'A')]

    const merged = mergeRowsForFilter(prev, wanted)

    expect(merged).toEqual([
      { item: wanted[0], phase: 'stay' },
      {
        item: prev[1].item,
        phase: 'exit',
        exitDelayMs: 0,
      },
    ])
  })

  it('restarts enter sequence when active rows remain but the wanted set grows', () => {
    const prev: GridRow[] = [
      { item: essay('/essays/a', 'A'), phase: 'stay' },
      { item: essay('/essays/b', 'B'), phase: 'stay' },
    ]
    const wanted = [essay('/essays/a', 'A'), essay('/essays/b', 'B'), essay('/essays/c', 'C')]

    const merged = mergeRowsForFilter(prev, wanted)

    expect(merged).toEqual([
      { item: wanted[0], phase: 'enter', enterDelayMs: 0 },
      { item: wanted[1], phase: 'enter', enterDelayMs: cardStaggerMs },
      { item: wanted[2], phase: 'enter', enterDelayMs: cardStaggerMs * 2 },
    ])
  })

  it('preserves an existing exit row instead of duplicating it', () => {
    const exiting = { item: essay('/essays/a', 'A'), phase: 'exit' as const, exitDelayMs: 48 }
    const prev: GridRow[] = [{ item: essay('/essays/b', 'B'), phase: 'stay' }, exiting]
    const wanted = [essay('/essays/b', 'B')]

    const merged = mergeRowsForFilter(prev, wanted)

    expect(merged).toEqual([{ item: wanted[0], phase: 'stay' }, exiting])
  })

  it('returns only exiting rows when wanted is empty', () => {
    const prev = asRows([essay('/essays/a', 'A'), essay('/essays/b', 'B')])
    const merged = mergeRowsForFilter(prev, [])

    expect(merged).toEqual([
      { item: prev[0].item, phase: 'exit', exitDelayMs: 0 },
      { item: prev[1].item, phase: 'exit', exitDelayMs: cardExitStaggerMs },
    ])
  })

  it('handles partial overlap with stay, enter, and exit rows', () => {
    const prev: GridRow[] = [
      { item: essay('/essays/a', 'A'), phase: 'stay' },
      { item: artifact('/music/old', 'Old'), phase: 'stay' },
    ]
    const wanted = [essay('/essays/a', 'A'), artifact('/music/new', 'New')]

    const merged = mergeRowsForFilter(prev, wanted)

    expect(merged).toEqual([
      { item: wanted[0], phase: 'stay' },
      { item: wanted[1], phase: 'enter', enterDelayMs: 0 },
      { item: prev[1].item, phase: 'exit', exitDelayMs: 0 },
    ])
  })
})

describe('mergeRowsForFilter keys', () => {
  it('keys rows by href', () => {
    const item = essay('/essays/a', 'A')
    expect(itemKey(item)).toBe('/essays/a')
  })
})
