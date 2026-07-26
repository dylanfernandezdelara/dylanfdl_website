/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { batchForPhase, usePhaseBatchTimeout } from '../components/card-grid/phaseBatch'
import type { GridRow } from '../components/card-grid/model'
import type { CardGridSerializableItem } from '../lib/buildCardGridItems'

function writing(href: string): CardGridSerializableItem {
  return {
    kind: 'writing',
    category: 'notes',
    sortDate: '2025-01-01',
    slug: href.replace('/notes/', ''),
    title: href,
    dateLabel: 'Jan 2025',
    href,
  }
}

function enterRow(href: string, enterDelayMs: number): GridRow {
  return { item: writing(href), phase: 'enter', enterDelayMs }
}

describe('batchForPhase', () => {
  it('returns null when no rows match the phase', () => {
    expect(batchForPhase([], 'enter', 500, (row) => row.enterDelayMs ?? 0)).toBeNull()
  })

  it('computes signature and max end from matching rows', () => {
    const batch = batchForPhase(
      [enterRow('/notes/b', 100), enterRow('/notes/a', 0)],
      'enter',
      500,
      (row) => row.enterDelayMs ?? 0,
    )

    expect(batch).toEqual({
      signature: '/notes/a\0/notes/b',
      maxEndMs: 600,
    })
  })
})

describe('usePhaseBatchTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires after maxEndMs from the batch origin', () => {
    const onFire = vi.fn()
    renderHook(() =>
      usePhaseBatchTimeout({ signature: 'a', maxEndMs: 400 }, onFire),
    )

    act(() => {
      vi.advanceTimersByTime(399)
    })
    expect(onFire).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onFire).toHaveBeenCalledOnce()
  })

  it('does not fully reset the clock when an overlapping signature extends', () => {
    const onFire = vi.fn()
    const { rerender } = renderHook(
      ({ batch }) => usePhaseBatchTimeout(batch, onFire),
      {
        initialProps: {
          batch: { signature: 'a', maxEndMs: 400 } as { signature: string; maxEndMs: number } | null,
        },
      },
    )

    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ batch: { signature: 'a\0b', maxEndMs: 500 } })

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(onFire).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onFire).toHaveBeenCalledOnce()
  })

  it('resets the origin when the signature has no overlap', () => {
    const onFire = vi.fn()
    const { rerender } = renderHook(
      ({ batch }) => usePhaseBatchTimeout(batch, onFire),
      {
        initialProps: {
          batch: { signature: 'a', maxEndMs: 400 } as { signature: string; maxEndMs: number } | null,
        },
      },
    )

    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ batch: { signature: 'z', maxEndMs: 300 } })

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(onFire).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onFire).toHaveBeenCalledOnce()
  })
})
