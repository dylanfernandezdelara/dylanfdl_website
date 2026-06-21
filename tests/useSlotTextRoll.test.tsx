/**
 * @vitest-environment happy-dom
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const slotTextSet = vi.fn()
const slotTextDestroy = vi.fn()

vi.mock('slot-text', () => ({
  slotText: vi.fn(() => ({
    set: slotTextSet,
    destroy: slotTextDestroy,
  })),
}))

vi.mock('@/hooks/usePrefersReducedMotion', () => ({
  default: vi.fn(() => ({ reduced: false, ready: true })),
}))

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import useSlotTextRoll from '@/hooks/useSlotTextRoll'

function mountSpan(result: ReturnType<typeof renderHook<ReturnType<typeof useSlotTextRoll>>>['result']) {
  const span = document.createElement('span')
  span.textContent = 'Recently listened to'
  act(() => {
    ;(result.current.slotRef as (node: HTMLSpanElement | null) => void)(span)
  })
  return span
}

describe('useSlotTextRoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePrefersReducedMotion).mockReturnValue({ reduced: false, ready: true })
  })

  it('queues a second two-phase roll after the slot already owns the DOM', async () => {
    const { result } = renderHook(() =>
      useSlotTextRoll({ direction: 'up', twoPhaseFromToRoll: true }),
    )

    mountSpan(result)

    act(() => {
      result.current.queueRollFromTo('Recently listened to', 'Currently listening to')
    })

    await waitFor(() => {
      expect(result.current.slotTextActive).toBe(true)
    })

    expect(slotTextSet).toHaveBeenCalled()

    act(() => {
      result.current.queueRollFromTo('Currently listening to', 'Recently listened to')
    })

    await waitFor(() => {
      expect(slotTextSet.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('reuses the live controller for incremental rollTo updates', async () => {
    const { result } = renderHook(() => useSlotTextRoll({ direction: 'up' }))

    const span = mountSpan(result)

    act(() => {
      result.current.rollTo('Daft Punk')
    })

    span.innerHTML = '<span class="char-slot"></span>'
    slotTextSet.mockClear()
    slotTextDestroy.mockClear()

    act(() => {
      result.current.rollTo('Instant Crush')
    })

    expect(slotTextDestroy).not.toHaveBeenCalled()
    expect(slotTextSet).toHaveBeenCalledWith(
      'Instant Crush',
      expect.objectContaining({ direction: 'up' }),
    )
  })

  it('keeps the React fallback when reduced motion is enabled', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue({ reduced: true, ready: true })

    const { result } = renderHook(() =>
      useSlotTextRoll({ direction: 'up', twoPhaseFromToRoll: true }),
    )

    mountSpan(result)

    act(() => {
      result.current.queueRollFromTo('Recently listened to', 'Currently listening to')
    })

    expect(result.current.active).toBe(false)
    expect(result.current.slotTextActive).toBe(false)
    expect(slotTextSet).not.toHaveBeenCalled()
  })
})
