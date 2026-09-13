/**
 * @vitest-environment happy-dom
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import LayoutGridHost from '../components/layout-grid/LayoutGridHost'
import {
  LAYOUT_GRID_LINE_WIDTH_PX,
  LAYOUT_GRID_MAJOR_PX,
  LAYOUT_GRID_MAJOR_REM,
  LAYOUT_GRID_MINOR_PX,
  LAYOUT_GRID_MINOR_REM,
  LAYOUT_GRID_STORAGE_KEY,
} from '../lib/layoutGrid'

function renderGridChrome() {
  return render(
    <LayoutGridHost>
      <p>page</p>
    </LayoutGridHost>,
  )
}

function overlay() {
  return document.querySelector('[data-layout-grid-overlay]')
}

describe('LayoutGridHost', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    cleanup()
    window.sessionStorage.clear()
    window.history.replaceState({}, '', '/')
    vi.unstubAllEnvs()
  })

  it('starts off and shows the overlay after the grid button is pressed', async () => {
    renderGridChrome()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Show layout grid' })).toBeTruthy()
    })
    expect(overlay()).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Show layout grid' }))

    const grid = overlay()
    expect(grid).not.toBeNull()
    expect(grid?.getAttribute('data-minor')).toBe(String(LAYOUT_GRID_MINOR_PX))
    expect(grid?.getAttribute('data-major')).toBe(String(LAYOUT_GRID_MAJOR_PX))
    expect(grid?.getAttribute('data-line-width')).toBe(String(LAYOUT_GRID_LINE_WIDTH_PX))
    expect(grid instanceof HTMLElement ? grid.style.getPropertyValue('--layout-grid-minor') : '').toBe(
      `${LAYOUT_GRID_MINOR_REM}rem`,
    )
    expect(grid instanceof HTMLElement ? grid.style.getPropertyValue('--layout-grid-major') : '').toBe(
      `${LAYOUT_GRID_MAJOR_REM}rem`,
    )
    expect(grid instanceof HTMLElement ? grid.style.getPropertyValue('--layout-grid-line') : '').toBe(
      `${LAYOUT_GRID_LINE_WIDTH_PX}px`,
    )
    expect(screen.getByRole('button', { name: 'Hide layout grid' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(document.querySelector('[data-layout-grid-legend]')?.textContent).toBe(
      `${LAYOUT_GRID_MINOR_PX} / ${LAYOUT_GRID_MAJOR_PX} · ${LAYOUT_GRID_LINE_WIDTH_PX}px`,
    )
    expect(window.sessionStorage.getItem(LAYOUT_GRID_STORAGE_KEY)).toBe('on')
  })

  it('toggles from the g hotkey and ignores g in a text field', async () => {
    renderGridChrome()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Show layout grid' })).toBeTruthy()
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'g' })
    })
    expect(overlay()).not.toBeNull()

    await act(async () => {
      fireEvent.keyDown(window, { key: 'g' })
    })
    expect(overlay()).toBeNull()

    const input = document.createElement('input')
    document.body.appendChild(input)
    await act(async () => {
      fireEvent.keyDown(input, { key: 'g' })
    })
    expect(overlay()).toBeNull()
    input.remove()
  })

  it('turns on from ?grid=1 after mount', async () => {
    window.history.replaceState({}, '', '/?grid=1')
    renderGridChrome()

    await waitFor(() => {
      expect(overlay()).not.toBeNull()
    })
    expect(window.sessionStorage.getItem(LAYOUT_GRID_STORAGE_KEY)).toBe('on')
  })

  it('lets ?grid=0 override a stored on value', async () => {
    window.sessionStorage.setItem(LAYOUT_GRID_STORAGE_KEY, 'on')
    window.history.replaceState({}, '', '/about?grid=0')
    renderGridChrome()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Show layout grid' })).toBeTruthy()
    })
    expect(overlay()).toBeNull()
    expect(window.sessionStorage.getItem(LAYOUT_GRID_STORAGE_KEY)).toBe('off')
  })

  it('renders no testing chrome when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    renderGridChrome()

    expect(screen.queryByRole('button', { name: /layout grid/i })).toBeNull()
    expect(overlay()).toBeNull()

    fireEvent.keyDown(window, { key: 'g' })
    expect(overlay()).toBeNull()

    vi.unstubAllEnvs()
  })

  it('restores the session when the query is absent', async () => {
    window.sessionStorage.setItem(LAYOUT_GRID_STORAGE_KEY, 'on')
    renderGridChrome()

    await waitFor(() => {
      expect(overlay()).not.toBeNull()
    })
  })
})
