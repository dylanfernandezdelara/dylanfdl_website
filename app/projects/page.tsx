import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
}

export default function Projects() {
  return (
    <>
      <div className="container" style={{
        paddingTop: '2rem',
        paddingBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <h1 style={{
            fontSize: '1rem',
            fontWeight: '500',
            margin: 0,
            color: 'var(--yellow)'
          }}>
            <Link href="/about" style={{ color: 'var(--yellow)' }}>
              Dylan Fernandez de Lara
            </Link>
          </h1>
          <nav style={{
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            color: 'var(--fg3)'
          }}>
            <Link href="/about" style={{ color: 'var(--fg3)', fontWeight: '400' }}>About</Link>
            <Link href="/writing" style={{ color: 'var(--fg3)', fontWeight: '400' }}>Writing</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/projects" style={{ color: 'var(--aqua)', fontWeight: '400' }}>Projects</Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      <div className="content-wrapper" style={{
        paddingTop: '3rem',
        paddingBottom: '4rem'
      }}>
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
            {`Projects coming soon.`}
          </p>
        </div>
      </div>
    </>
  )
}
