/**
 * @vitest-environment happy-dom
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  LAYOUT_GRID_LINE_WIDTH_PX,
  LAYOUT_GRID_MAJOR_PX,
  LAYOUT_GRID_MAJOR_REM,
  LAYOUT_GRID_MINOR_PX,
  LAYOUT_GRID_MINOR_REM,
  isLayoutGridAvailable,
  isLayoutGridHotkey,
  isTypingTarget,
  parseLayoutGridQuery,
  readLayoutGridSession,
  writeLayoutGridSession,
} from '../lib/layoutGrid'

describe('layoutGrid', () => {
  it('is unavailable in production builds', () => {
    expect(isLayoutGridAvailable('production')).toBe(false)
    expect(isLayoutGridAvailable('development')).toBe(true)
    expect(isLayoutGridAvailable('test')).toBe(true)
  })

  it('keeps the testing overlay out of production page chrome', () => {
    const layout = readFileSync(resolve('src/app/layout.tsx'), 'utf8')
    const home = readFileSync(resolve('src/app/page.tsx'), 'utf8')
    const documentView = readFileSync(resolve('components/SiteDocumentView.tsx'), 'utf8')
    const articleShell = readFileSync(resolve('components/article/ArticleShell.tsx'), 'utf8')
    const gate = readFileSync(
      resolve('components/layout-grid/MaybeLayoutGridHost.tsx'),
      'utf8',
    )

    expect(layout).toContain('MaybeLayoutGridHost')
    expect(layout).not.toContain("from '@/components/layout-grid/LayoutGridHost'")
    expect(home).not.toContain('LayoutGridToggle')
    expect(documentView).not.toContain('LayoutGridToggle')
    expect(articleShell).not.toContain('LayoutGridToggle')
    expect(gate).toContain("process.env.NODE_ENV === 'production'")
    expect(gate).toContain("await import('./LayoutGridHost')")
  })

  it('locks one minor step, one major step, and one line width', () => {
    expect(LAYOUT_GRID_MINOR_PX).toBe(8)
    expect(LAYOUT_GRID_MAJOR_PX).toBe(24)
    expect(LAYOUT_GRID_MAJOR_PX).toBe(LAYOUT_GRID_MINOR_PX * 3)
    expect(LAYOUT_GRID_MINOR_REM).toBe(0.5)
    expect(LAYOUT_GRID_MAJOR_REM).toBe(1.5)
    expect(LAYOUT_GRID_LINE_WIDTH_PX).toBe(1)
  })

  it('reads ?grid= as an explicit on/off, otherwise leaves the choice unset', () => {
    expect(parseLayoutGridQuery('?grid=1')).toBe(true)
    expect(parseLayoutGridQuery('grid=true')).toBe(true)
    expect(parseLayoutGridQuery('?grid=0')).toBe(false)
    expect(parseLayoutGridQuery('?grid=off')).toBe(false)
    expect(parseLayoutGridQuery('?grid=false')).toBe(false)
    expect(parseLayoutGridQuery('')).toBeNull()
    expect(parseLayoutGridQuery('?theme=dark')).toBeNull()
  })

  it('treats only unmodified g as the overlay hotkey', () => {
    expect(isLayoutGridHotkey(new KeyboardEvent('keydown', { key: 'g' }))).toBe(true)
    expect(isLayoutGridHotkey(new KeyboardEvent('keydown', { key: 'G' }))).toBe(true)
    expect(
      isLayoutGridHotkey(new KeyboardEvent('keydown', { key: 'g', metaKey: true })),
    ).toBe(false)
    expect(
      isLayoutGridHotkey(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true })),
    ).toBe(false)
    expect(
      isLayoutGridHotkey(new KeyboardEvent('keydown', { key: 'g', altKey: true })),
    ).toBe(false)
    expect(isLayoutGridHotkey(new KeyboardEvent('keydown', { key: 'k' }))).toBe(false)
  })

  it('ignores g while typing in a field', () => {
    const input = document.createElement('input')
    expect(isTypingTarget(input)).toBe(true)
    expect(
      isLayoutGridHotkey(
        new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
      ),
    ).toBe(true)

    const typingEvent = new KeyboardEvent('keydown', { key: 'g' })
    Object.defineProperty(typingEvent, 'target', { value: input })
    expect(isLayoutGridHotkey(typingEvent)).toBe(false)
  })

  it('snaps page, document, and article measures to the 8 / 24 rhythm', () => {
    const tw = readFileSync(resolve('tailwind.config.ts'), 'utf8')
    const home = readFileSync(resolve('src/app/page.tsx'), 'utf8')
    const documentView = readFileSync(resolve('components/SiteDocumentView.tsx'), 'utf8')
    const tabs = readFileSync(resolve('components/card-grid/CardGridTabs.tsx'), 'utf8')
    const card = readFileSync(resolve('components/Card.tsx'), 'utf8')
    const columns = readFileSync(resolve('components/card-grid/CardGridColumns.tsx'), 'utf8')
    const shell = readFileSync(resolve('src/styles/article/shell.css'), 'utf8')

    expect(tw).toContain("reading: '33rem'")
    expect(home).toContain('leading-6')
    expect(home).toContain('max-w-[39rem]')
    expect(home).toContain('leading-8')
    expect(home).not.toContain('leading-[1.6]')
    expect(documentView).toContain('min-h-6')
    expect(documentView).toContain('leading-8')
    expect(documentView).toContain('gap-4')
    expect(tabs).toContain('h-8')
    expect(tabs).toContain('leading-4')
    expect(tabs).toContain('p-0.5')
    expect(tabs).not.toContain('p-2')
    expect(tabs).not.toContain('py-2')
    expect(card).toContain('gap-4 px-4 py-4')
    expect(card).toContain('leading-6')
    expect(columns).toContain('gap-4')
    expect(shell).toContain('--article-measure: 33rem;')
    expect(shell).toContain('--article-paragraph-gap: 1.5rem;')
    expect(shell).toContain('--article-subsection-space: 1.5rem;')
    expect(shell).toContain('--article-heading-space-after: 0.5rem;')
    expect(shell).toContain('--article-heading-line-height: 2rem;')
    expect(shell).toContain('line-height: 2rem;')
    expect(shell).toContain('line-height: 1.5rem;')
  })

  it('keeps CSS rhythm tokens aligned with the overlay constants', () => {
    const theme = readFileSync(resolve('src/styles/theme.css'), 'utf8')
    const overlayCss = readFileSync(
      resolve('components/layout-grid/layout-grid.css'),
      'utf8',
    )

    expect(theme).toContain('--space-minor: 0.5rem;')
    expect(theme).toContain('--space-major: 1.5rem;')
    expect(theme).toContain('--layout-grid-line: 1px;')
    expect(overlayCss).toContain('var(--layout-grid-line)')
    expect(overlayCss).toContain('var(--layout-grid-minor)')
    expect(overlayCss).toContain('var(--layout-grid-major)')
  })

  it('persists the session as on/off', () => {
    const storage = new Map<string, string>()
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
    }

    expect(readLayoutGridSession(adapter)).toBe(false)
    writeLayoutGridSession(adapter, true)
    expect(readLayoutGridSession(adapter)).toBe(true)
    writeLayoutGridSession(adapter, false)
    expect(readLayoutGridSession(adapter)).toBe(false)
  })
})
