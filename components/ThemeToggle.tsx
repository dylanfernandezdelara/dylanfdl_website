'use client'

import { useEffect, useState } from 'react'
import { Around } from '@theme-toggles/react'
import '@theme-toggles/react/css/Around.css'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || 'light'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
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
          border: '1px solid var(--bg2)',
          cursor: 'pointer'
        }}
        aria-label="Toggle theme"
      />
    )
  }

  return (
    <Around
      toggled={theme === 'dark'}
      onToggle={handleToggle}
      duration={300}
      className="theme-toggle"
      style={{
        minWidth: '44px',
        minHeight: '44px',
        color: 'var(--fg2)',
        fontSize: '1.25rem',
        background: 'transparent',
        border: '1px solid var(--bg2)',
        borderRadius: '2px',
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'rgba(95, 135, 175, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s ease, color 0.2s ease',
        padding: '0.25rem'
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          e.currentTarget.style.borderColor = 'var(--blue)'
          e.currentTarget.style.color = 'var(--blue)'
        }
      }}
      onMouseLeave={(e) => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          e.currentTarget.style.borderColor = 'var(--bg2)'
          e.currentTarget.style.color = 'var(--fg2)'
        }
      }}
      aria-label="Toggle theme"
    />
  )
}

