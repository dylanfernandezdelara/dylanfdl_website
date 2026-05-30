'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

function resolvedDark(): boolean {
  if (typeof document === 'undefined') return false
  const root = document.documentElement
  if (root.classList.contains('dark')) return true
  if (root.classList.contains('light')) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeToggle() {
  // `mounted` stays false during SSR and on the first client render, so we
  // don't commit to a Sun/Moon before reading the DOM. The pre-hydration
  // theme-init script has already applied `.dark` / `.light` to <html>, so
  // the first post-mount paint is correct. Without this guard, dark-mode
  // users briefly see the Moon icon before useEffect swaps to Sun.
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    setIsDark(resolvedDark())
    setMounted(true)

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

    if (!prefersReducedMotion && typeof document.startViewTransition === 'function') {
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
        'fixed bottom-5 right-5 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-bg3 bg-bg1 text-fg0 shadow-[var(--elevated-shadow)] transition-none hover:border-fg4/35 hover:bg-bg2 focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2',
      )}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      suppressHydrationWarning
    >
      {!mounted ? (
        // Reserve icon slot to keep the button's size stable pre-hydration.
        <span className="h-5 w-5 shrink-0" aria-hidden />
      ) : isDark ? (
        <Sun
          className="h-5 w-5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <Moon
          className="h-5 w-5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          strokeWidth={2}
          aria-hidden
        />
      )}
    </button>
  )
}
