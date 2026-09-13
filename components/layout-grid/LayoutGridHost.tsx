'use client'

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import LayoutGridToggle from '@/components/layout-grid/LayoutGridToggle'
import {
  LAYOUT_GRID_LINE_WIDTH_PX,
  LAYOUT_GRID_MAJOR_PX,
  LAYOUT_GRID_MAJOR_REM,
  LAYOUT_GRID_MINOR_PX,
  LAYOUT_GRID_MINOR_REM,
  isLayoutGridAvailable,
  isLayoutGridHotkey,
  parseLayoutGridQuery,
  readLayoutGridSession,
  writeLayoutGridSession,
} from '@/lib/layoutGrid'

import './layout-grid.css'

function LayoutGridOverlay() {
  const overlayStyle = {
    '--layout-grid-minor': `${LAYOUT_GRID_MINOR_REM}rem`,
    '--layout-grid-major': `${LAYOUT_GRID_MAJOR_REM}rem`,
    '--layout-grid-line': `${LAYOUT_GRID_LINE_WIDTH_PX}px`,
  } as CSSProperties

  return (
    <div
      data-layout-grid-overlay=""
      data-minor={`${LAYOUT_GRID_MINOR_PX}`}
      data-major={`${LAYOUT_GRID_MAJOR_PX}`}
      data-line-width={`${LAYOUT_GRID_LINE_WIDTH_PX}`}
      aria-hidden
      style={overlayStyle}
    />
  )
}

export default function LayoutGridHost({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const available = isLayoutGridAvailable()

  useEffect(() => {
    if (!available) return

    const fromQuery = parseLayoutGridQuery(window.location.search)
    const next =
      fromQuery !== null ? fromQuery : readLayoutGridSession(window.sessionStorage)
    setEnabled(next)
    if (fromQuery !== null) {
      writeLayoutGridSession(window.sessionStorage, fromQuery)
    }
    setReady(true)
  }, [available])

  const toggle = useCallback(() => {
    if (!available) return
    setEnabled((current) => {
      const next = !current
      writeLayoutGridSession(window.sessionStorage, next)
      return next
    })
  }, [available])

  useEffect(() => {
    if (!available) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isLayoutGridHotkey(event)) return
      event.preventDefault()
      toggle()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [available, toggle])

  if (!available) {
    return children
  }

  return (
    <>
      {children}
      {enabled ? <LayoutGridOverlay /> : null}
      <div data-layout-grid-toolbar="">
        {enabled ? (
          <p data-layout-grid-legend="" aria-hidden>
            {`${LAYOUT_GRID_MINOR_PX} / ${LAYOUT_GRID_MAJOR_PX} · ${LAYOUT_GRID_LINE_WIDTH_PX}px`}
          </p>
        ) : null}
        <LayoutGridToggle enabled={enabled} ready={ready} onToggle={toggle} />
      </div>
    </>
  )
}
