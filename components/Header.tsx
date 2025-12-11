import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  return (
    <div className="container" style={{
      paddingTop: '2rem',
      paddingBottom: '0.5rem'
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
          fontWeight: '700',
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
          <Link href="/about" style={{ color: 'var(--aqua)', fontWeight: '400' }}>About</Link>
          <Link href="/writing" style={{ color: 'var(--fg3)', fontWeight: '400' }}>Writing</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/projects" style={{ color: 'var(--fg3)', fontWeight: '400' }}>Projects</Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  )
}
