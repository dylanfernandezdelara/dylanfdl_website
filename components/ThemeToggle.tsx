'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as stylex from '@stylexjs/stylex'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

const styles = stylex.create({
  button: {
    position: 'relative',
    top: '-1px',
    margin: '-0.25rem',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    color: 'var(--fg2)',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--fg1)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'var(--blue)',
      outlineOffset: '2px',
    },
  },
  icon: {
    height: '1rem',
    width: '1rem',
    flexShrink: 0,
  },
})

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

  const iconSx = stylex.props(styles.icon)

  return (
    <button
      type="button"
      onClick={toggle}
      {...stylex.props(styles.button)}
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
        <span {...iconSx} aria-hidden />
      ) : isDark ? (
        <Sun className={iconSx.className} style={iconSx.style} strokeWidth={2} aria-hidden />
      ) : (
        <Moon className={iconSx.className} style={iconSx.style} strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
