'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const PageSearchPalette = dynamic(() => import('@/components/PageSearchPalette'), {
  ssr: false,
})

/**
 * Defers the cmdk/dialog search chunk until the browser is idle (or the user
 * presses ⌘/Ctrl+K). Keeps the home critical path free of that dependency graph.
 */
export default function PageSearchPaletteHost() {
  const [shouldMount, setShouldMount] = useState(false)
  const [initialOpen, setInitialOpen] = useState(false)

  useEffect(() => {
    if (shouldMount) {
      return
    }

    const mount = () => setShouldMount(true)

    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 2000 })
    } else {
      timeoutId = setTimeout(mount, 1)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setInitialOpen(true)
        mount()
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
  }, [shouldMount])

  if (!shouldMount) {
    return null
  }

  return <PageSearchPalette initialOpen={initialOpen} />
}
