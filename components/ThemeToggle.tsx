'use client'

import { useEffect, useState } from 'react'
import { Around } from '@theme-toggles/react'
import '@theme-toggles/react/css/Around.css'

// Initialize theme synchronously on client side
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const docTheme = document.documentElement.getAttribute('data-theme')
  const savedTheme = localStorage.getItem('theme')
  return (docTheme || savedTheme || 'light') as 'light' | 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Ensure document element has the correct theme on mount
    const currentTheme = getInitialTheme()
    document.documentElement.setAttribute('data-theme', currentTheme)
    setTheme(currentTheme)
    setMounted(true)
  }, [])

  const handleToggle = (toggled: boolean) => {
    // toggled = true means dark mode
    const newTheme = toggled ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        style={{
          minWidth: '44px',
          minHeight: '44px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer'
        }}
        aria-label="Toggle theme"
      />
    )
  }

  const isLightMode = theme === 'light'

  return (
    <Around
      toggled={theme === 'dark'}
      onToggle={handleToggle}
      duration={300}
      className={`theme-toggle ${isLightMode ? 'theme-toggle-light' : ''}`}
      style={{
        minWidth: '44px',
        minHeight: '44px',
        color: 'var(--fg2)',
        fontSize: '1rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'rgba(95, 135, 175, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease',
        padding: '0.25rem'
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          e.currentTarget.style.color = 'var(--blue)'
        }
      }}
      onMouseLeave={(e) => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          e.currentTarget.style.color = 'var(--fg2)'
        }
      }}
      aria-label="Toggle theme"
    />
  )
}

