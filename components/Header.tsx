import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import type { CSSProperties } from 'react'

type ActiveNavItem = 'about' | 'writing' | 'projects'

export type HeaderProps = {
  /**
   * Which top-level nav item should be highlighted. Use `null` for none.
   * Defaults to "about" to preserve existing Home/About styling.
   */
  active?: ActiveNavItem | null
  /**
   * Show/hide the theme toggle control.
   */
  showThemeToggle?: boolean
  /**
   * Show/hide the Projects link.
   */
  showProjectsLink?: boolean
  /**
   * Fine-tuning for pages that historically used different spacing/sizing.
   */
  paddingBottom?: CSSProperties['paddingBottom']
  nameFontSize?: CSSProperties['fontSize']
}

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem',
  flexWrap: 'wrap',
}

const NAV_STYLE: CSSProperties = {
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '2rem',
  color: 'var(--fg3)',
}

const NAME_LINK_STYLE: CSSProperties = { color: 'var(--yellow)' }

function navLinkStyle(isActive: boolean): CSSProperties {
  return {
    color: isActive ? 'var(--aqua)' : 'var(--fg3)',
    fontWeight: '400',
  }
}

export default function Header({
  active = 'about',
  showThemeToggle = true,
  showProjectsLink = true,
  paddingBottom = '0.5rem',
  nameFontSize = '1rem',
}: HeaderProps) {
  return (
    <div
      className="container header-container"
      style={{
        paddingTop: '2rem',
        paddingBottom,
      }}
    >
      <div className="header-row" style={ROW_STYLE}>
        <h1
          style={{
            fontSize: nameFontSize,
            fontWeight: '500',
            margin: 0,
            color: 'var(--yellow)',
          }}
        >
          <Link href="/about" style={NAME_LINK_STYLE}>
            Dylan Fernandez de Lara
          </Link>
        </h1>

        <nav style={NAV_STYLE}>
          <Link href="/about" style={navLinkStyle(active === 'about')}>
            About
          </Link>
          <Link href="/writing" style={navLinkStyle(active === 'writing')}>
            Writing
          </Link>

          {(showProjectsLink || showThemeToggle) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {showProjectsLink && (
                <Link href="/projects" style={navLinkStyle(active === 'projects')}>
                  Projects
                </Link>
              )}
              {showThemeToggle && <ThemeToggle />}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
