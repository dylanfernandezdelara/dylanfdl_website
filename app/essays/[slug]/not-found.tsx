import Link from 'next/link'

export default function NotFound() {
  return (
    <>
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
        <Link href="/about" style={{
          fontSize: '0.875rem',
          color: 'var(--blue)'
        }}>
          ← Back to About
        </Link>
      </div>
    </>
  )
}

