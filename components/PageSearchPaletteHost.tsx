'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const PageSearchPalette = dynamic(() => import('@/components/PageSearchPalette'), {
  ssr: false,
})

function isSearchHotkey(event: KeyboardEvent): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
}

/**
 * Owns search hotkeys and open state for the life of the page. Loads the
 * cmdk/dialog chunk on idle (or on the first ⌘/Ctrl+K) so it stays off the
 * home critical path without a shortcut dead zone during import.
 */
export default function PageSearchPaletteHost() {
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = () => setLoaded(true)

    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(load, { timeout: 2000 })
    } else {
      timeoutId = setTimeout(load, 1)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isSearchHotkey(event)) {
        event.preventDefault()
        load()
        setOpen((prev) => !prev)
        return
      }

      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (!loaded) {
    return null
  }

  return <PageSearchPalette open={open} onOpenChange={setOpen} />
}
