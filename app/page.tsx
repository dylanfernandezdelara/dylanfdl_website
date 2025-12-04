import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="container" style={{
        paddingTop: '2rem',
        paddingBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '0.75rem',
          color: 'var(--yellow)'
        }}>
          <Link href="/about" style={{ color: 'var(--yellow)' }}>
            Dylan Fernandez de Lara
          </Link>
        </h1>
        <nav style={{
          fontSize: '0.875rem',
          display: 'flex',
          gap: '2rem',
          color: 'var(--fg3)'
        }}>
          <Link href="/about" style={{ color: 'var(--fg3)', fontWeight: '700' }}>About</Link>
          <Link href="/writing" style={{ color: 'var(--fg3)', fontWeight: '700' }}>Writing</Link>
        </nav>
      </div>

      <div className="content-wrapper" style={{
        paddingTop: '3rem',
        paddingBottom: '4rem'
      }}>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '1.5rem',
          color: 'var(--fg1)'
        }}>
          [A brief introduction or statement about yourself. This should feel personal and direct, not like a tagline.]
        </p>
      </div>
    </>
  )
}

