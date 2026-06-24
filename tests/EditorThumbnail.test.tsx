/**
 * @vitest-environment happy-dom
 */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as editorThumbnailCycle from '@/lib/editorThumbnailCycle'

vi.mock('@/hooks/usePrefersReducedMotion', () => ({
  default: vi.fn(() => ({ reduced: false, ready: true })),
}))

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import EditorThumbnail from '@/components/EditorThumbnail'

const PARTIAL_VISIBLE_LENGTH = 4
const { EDITOR_THUMBNAIL_FULL_TEXT } = editorThumbnailCycle
const rafCallbacks: FrameRequestCallback[] = []

describe('EditorThumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rafCallbacks.length = 0
    vi.mocked(usePrefersReducedMotion).mockReturnValue({ reduced: false, ready: true })
    vi.spyOn(editorThumbnailCycle, 'getVisibleLengthAt').mockReturnValue(PARTIAL_VISIBLE_LENGTH)
    vi.spyOn(editorThumbnailCycle, 'rollEditorThumbnailCycleTiming').mockReturnValue({
      typeThresholds: [100, 250, 400],
      typeTotalMs: 400,
      deleteThresholds: [80, 160],
      deleteTotalMs: 160,
      cycleDurationMs: 1710,
    })

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallbacks.push(callback)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => undefined)
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        constructor(callback: ResizeObserverCallback) {
          void callback
        }
      },
    )
  })

  it('shows the full text when reduced motion engages mid-cycle', async () => {
    const { container, rerender } = render(<EditorThumbnail />)

    await act(async () => {
      for (let frame = 0; frame < 4; frame += 1) {
        const callback = rafCallbacks.shift()
        if (!callback) {
          break
        }
        callback(0)
      }
    })

    expect(editorThumbnailCycle.rollEditorThumbnailCycleTiming).toHaveBeenCalled()
    expect(editorThumbnailCycle.getVisibleLengthAt).toHaveBeenCalled()
    expect(
      screen.getByText(EDITOR_THUMBNAIL_FULL_TEXT.slice(0, PARTIAL_VISIBLE_LENGTH)),
    ).toBeTruthy()

    vi.mocked(usePrefersReducedMotion).mockReturnValue({ reduced: true, ready: true })

    await act(async () => {
      rerender(<EditorThumbnail />)
    })

    expect(container.querySelector('.text-fg2')?.textContent).toBe(EDITOR_THUMBNAIL_FULL_TEXT)

    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
})
