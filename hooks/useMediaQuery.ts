import { useLayoutEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query. Returns `null` until the first layout read so
 * SSR markup can render both responsive trees, then the client can mount only
 * the active one.
 */
export default function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null)

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const update = () => {
      setMatches(mediaQuery.matches)
    }

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [query])

  return matches
}
