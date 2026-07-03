'use client'

import { useLayoutEffect, useState } from 'react'

export type PrefersReducedMotionState = {
  reduced: boolean
  ready: boolean
}

export default function usePrefersReducedMotion(): PrefersReducedMotionState {
  const [state, setState] = useState<PrefersReducedMotionState>({
    reduced: false,
    ready: false,
  })

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setState({
        reduced: mediaQuery.matches,
        ready: true,
      })
    }

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return state
}
