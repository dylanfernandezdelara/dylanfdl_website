import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <div className="container" style={{
        paddingTop: '2rem',
        paddingBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '500',
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
          <Link href="/about" style={{ color: 'var(--fg3)', fontWeight: '400' }}>About</Link>
          <Link href="/writing" style={{ color: 'var(--aqua)', fontWeight: '400' }}>Writing</Link>
        </nav>
      </div>

      <div className="content-wrapper" style={{
        paddingTop: '3rem',
        paddingBottom: '4rem'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: 'var(--red)'
        }}>
          Post not found
        </h1>
        <p style={{
          color: 'var(--fg2)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          The post you're looking for doesn't exist.
        </p>
        <Link href="/writing" style={{
          fontSize: '0.875rem',
          color: 'var(--blue)'
        }}>
          ← Back to Writing
        </Link>
      </div>
    </>
  )
}

