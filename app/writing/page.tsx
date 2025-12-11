import Link from 'next/link'
import { getPostsByYear } from '@/lib/posts'
import ThemeToggle from '@/components/ThemeToggle'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Writing',
}

export default function Writing() {
  const postsByYear = getPostsByYear()

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
            <Link href="/about" style={{ color: 'var(--fg3)', fontWeight: '400' }}>About</Link>
            <Link href="/writing" style={{ color: 'var(--aqua)', fontWeight: '400' }}>Writing</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/projects" style={{ color: 'var(--fg3)', fontWeight: '400' }}>Projects</Link>
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
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem'
        }}>
          {Object.keys(postsByYear)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((year) => (
              <div key={year}>
                <h2 style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  color: 'var(--gray)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {year}
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem'
                }}>
                  {postsByYear[year].map((post) => (
                    <div key={post.slug}>
                      <Link 
                        href={`/writing/${post.slug}`}
                        style={{
                          display: 'block'
                        }}
                      >
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          marginBottom: '0.5rem',
                          lineHeight: '1.5',
                          color: 'var(--blue)'
                        }}>
                          {post.title}
                        </h3>
                      </Link>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: 'var(--gray)',
                        marginBottom: '0.5rem'
                      }}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {post.excerpt && (
                        <p style={{
                          fontSize: '0.9375rem',
                          color: 'var(--fg2)',
                          lineHeight: '1.6',
                          marginTop: '0.5rem'
                        }}>
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {Object.keys(postsByYear).length === 0 && (
          <p style={{
            color: 'var(--gray)',
            fontSize: '0.9375rem',
            lineHeight: '1.6'
          }}>
            No posts yet. Create markdown files in <code style={{ color: 'var(--purple)', backgroundColor: 'var(--bg1)', padding: '0.2em 0.4em', border: '1px solid var(--bg2)' }}>content/writing/</code> to add your writing.
          </p>
        )}
      </div>
    </>
  )
}

