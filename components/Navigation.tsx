'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav style={{
      borderBottom: '1px solid var(--border-color)',
      padding: '2rem 0',
      marginBottom: '4rem'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          gap: '2rem',
          fontSize: '0.9rem',
          fontWeight: '400'
        }}>
          <Link 
            href="/" 
            style={{
              opacity: pathname === '/' ? 1 : 0.6
            }}
          >
            Home
          </Link>
          <Link 
            href="/about"
            style={{
              opacity: pathname === '/about' ? 1 : 0.6
            }}
          >
            About
          </Link>
          <Link 
            href="/writing"
            style={{
              opacity: pathname === '/writing' ? 1 : 0.6
            }}
          >
            Writing
          </Link>
        </div>
      </div>
    </nav>
  )
}

