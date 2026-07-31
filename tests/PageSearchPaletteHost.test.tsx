/**
 * @vitest-environment happy-dom
 */
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const paletteSpy = vi.fn()

vi.mock('next/dynamic', () => ({
  default: () =>
    function MockPageSearchPalette(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
      paletteSpy(props)
      return (
        <div data-testid="page-search-palette" data-open={props.open ? 'true' : 'false'}>
          palette
        </div>
      )
    },
}))

import PageSearchPaletteHost from '../components/PageSearchPaletteHost'

describe('PageSearchPaletteHost', () => {
  beforeEach(() => {
    paletteSpy.mockClear()
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((cb: IdleRequestCallback) => {
        return window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 1 }), 0)
      }),
    )
    vi.stubGlobal(
      'cancelIdleCallback',
      vi.fn((id: number) => {
        window.clearTimeout(id)
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads the palette on idle without opening it', async () => {
    render(<PageSearchPaletteHost />)

    await waitFor(() => {
      expect(paletteSpy).toHaveBeenCalled()
    })

    expect(paletteSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: false }),
    )
  })

  it('toggles open via ⌘/Ctrl+K even before the idle load finishes', async () => {
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn(() => 1),
    )

    render(<PageSearchPaletteHost />)
    expect(paletteSpy).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', metaKey: true })
    })

    await waitFor(() => {
      expect(paletteSpy).toHaveBeenCalled()
    })
    expect(paletteSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: true }),
    )

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', metaKey: true })
    })

    expect(paletteSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: false }),
    )
  })

  it('keeps ⌘/Ctrl+K working after idle mount (no hotkey dead zone)', async () => {
    render(<PageSearchPaletteHost />)

    await waitFor(() => {
      expect(paletteSpy).toHaveBeenCalled()
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })

    expect(paletteSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: true }),
    )

    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })

    expect(paletteSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: false }),
    )
  })
})
