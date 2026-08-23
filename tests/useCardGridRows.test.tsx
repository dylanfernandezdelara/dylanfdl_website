/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useCardGridRows from '../components/card-grid/useCardGridRows'
import {
  cardAnimMs,
  cardInitialStaggerCap,
  cardStaggerMs,
} from '../components/card-grid/constants'
import type { CardGridSerializableItem } from '../lib/buildCardGridItems'

function writing(
  href: string,
  title: string,
  category: 'notes' | 'projects' = 'notes',
): CardGridSerializableItem {
  return {
    kind: 'writing',
    category,
    sortDate: '2025-01-01',
    slug: href.replace(/^\/(notes|projects)\//, ''),
    title,
    dateLabel: 'Jan 2025',
    href,
  }
}

const items = [
  writing('/notes/a', 'A'),
  writing('/notes/b', 'B'),
  writing('/projects/c', 'C', 'projects'),
]

function stubMatchMedia(initialMatches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: initialMatches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('useCardGridRows', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('SSRs the initial grid in enter phase with staggered delays', () => {
    const { result } = renderHook(() => useCardGridRows(items))

    expect(result.current.activeRows.map((row) => row.phase)).toEqual([
      'enter',
      'enter',
      'enter',
    ])
    expect(result.current.activeRows.map((row) => row.enterDelayMs)).toEqual([
      0,
      cardStaggerMs,
      cardStaggerMs * 2,
    ])
  })

  it('keeps the initial enter sequence without rewriting on ready', () => {
    const { result } = renderHook(() => useCardGridRows(items))

    expect(result.current.activeRows.every((row) => row.phase === 'enter')).toBe(true)
    expect(result.current.activeRows.map((row) => row.enterDelayMs)).toEqual([
      0,
      cardStaggerMs,
      cardStaggerMs * 2,
    ])
  })

  it('batches enter → stay once without per-card commits', () => {
    const { result } = renderHook(() => useCardGridRows(items))
    const batchMs = Math.min(2, cardInitialStaggerCap) * cardStaggerMs + cardAnimMs

    act(() => {
      vi.advanceTimersByTime(batchMs)
    })

    expect(result.current.activeRows.every((row) => row.phase === 'stay')).toBe(true)
  })

  it('shows stay immediately when prefers-reduced-motion is set', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useCardGridRows(items))

    expect(result.current.activeRows.every((row) => row.phase === 'stay')).toBe(true)
  })

  it('merges filter changes after mount', () => {
    const { result } = renderHook(() => useCardGridRows(items))

    act(() => {
      result.current.selectFilter('notes')
    })

    expect(result.current.activeRows.map((row) => row.item.href)).toEqual([
      '/notes/a',
      '/notes/b',
    ])
    expect(result.current.exitRows).toHaveLength(1)
    expect(result.current.exitRows[0]?.item.href).toBe('/projects/c')
  })

  it('resets to all when the current filter has no cards', () => {
    const notesOnly = items.filter((item) => item.category === 'notes')
    const { result } = renderHook(() => useCardGridRows(notesOnly))

    act(() => {
      result.current.selectFilter('projects')
    })

    expect(result.current.filter).toBe('all')
    expect(result.current.tabOptions.map((tab) => tab.id)).toEqual(['all', 'notes'])
  })
})
