import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const ICON_SIZE_CLASSES = 'h-4 w-4 shrink-0'

function resolvedDark(): boolean {
  if (typeof document === 'undefined') return false
  const root = document.documentElement
  if (root.classList.contains('dark')) return true
  if (root.classList.contains('light')) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeToggle() {
  const [hasReadDomTheme, setHasReadDomTheme] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const { reduced: prefersReducedMotion, ready: motionReady } = usePrefersReducedMotion()

  useEffect(() => {
    setIsDark(resolvedDark())
    setHasReadDomTheme(true)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSchemeChange = () => {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') return
      setIsDark(mq.matches)
    }

    mq.addEventListener('change', onSchemeChange)
    return () => mq.removeEventListener('change', onSchemeChange)
  }, [])

  const toggle = () => {
    const nextIsDark = !resolvedDark()
    const apply = () => {
      document.documentElement.classList.remove('light', 'dark')
      if (nextIsDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.add('light')
        localStorage.setItem('theme', 'light')
      }
      setIsDark(nextIsDark)
    }

    if (motionReady && !prefersReducedMotion && typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply)
    } else {
      apply()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'relative -top-px -m-1 flex shrink-0 items-center justify-center p-1 text-fg2 transition-colors duration-150 hover:text-fg1 focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2',
      )}
      aria-label={
        !hasReadDomTheme
          ? 'Toggle theme'
          : isDark
            ? 'Switch to light theme'
            : 'Switch to dark theme'
      }
      suppressHydrationWarning
    >
      {!hasReadDomTheme ? (
        <span className={ICON_SIZE_CLASSES} aria-hidden />
      ) : isDark ? (
        <Sun className={ICON_SIZE_CLASSES} strokeWidth={2} aria-hidden />
      ) : (
        <Moon className={ICON_SIZE_CLASSES} strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
