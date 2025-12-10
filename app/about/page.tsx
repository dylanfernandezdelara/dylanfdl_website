import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowUpRight } from 'lucide-react'

export default function About() {
  return (
    <>
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

      <div className="content-wrapper" style={{
        paddingTop: '2rem',
        paddingBottom: '4rem'
      }}>
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '500',
            marginBottom: '1rem',
            color: 'var(--fg0)'
          }}>
            About me
          </h1>
          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
            {`I'm Dylan.`}
          </p>

          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
            {`I am an `}
            {'optimist'.split('').map((letter, index) => (
              <span
                key={index}
                className="rainbow-letter"
                style={{
                  animationDelay: `${index * 0.15}s`
                }}
              >
                {letter}
              </span>
            ))}
            {` and believe that technology can be used for good.`}
            </p>

            <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
              {`I am a Yale graduate and based in New York.`}
              <br />
              {`I am an engineer on the Core OS team in `}
              <a 
                href="https://www.meta.com/ai-glasses/meta-ray-ban-display/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--fg1)',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.125rem'
                }}
              >
                {`Wearables`}
                <ArrowUpRight size={10} style={{ flexShrink: 0 }} />
              </a>
              {` at Meta Reality Labs.`}
          </p>

          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
              {`My recent work involves training ML models to reduce crashes in our lab, building out an Android crash reporting 
              service and scaling server infrastructure to support an increasing number of devices.`}
          </p>

          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '500',
            marginTop: '3rem',
            marginBottom: '1rem',
            color: 'var(--fg0)'
          }}>
            Fun artifacts
          </h2>

          <ul style={{
            marginBottom: '1.5rem',
            paddingLeft: '1.5rem',
            color: 'var(--gray)',
            listStyleType: 'disc'
          }}>
            <li style={{ marginBottom: '0.25rem' }}>
              <a
                href="https://youtu.be/WlSkFFIchMw?si=A3N296fd7kTbMch1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.125rem',
                  color: 'var(--fg1)',
                  textDecoration: 'underline'
                }}
              >
                {`Yale Symphony Orchestra Halloween Show (me acting ?!)`}
                <ArrowUpRight size={10} style={{ flexShrink: 0 }} />
              </a>
            </li>
            <li style={{ marginBottom: '0.25rem' }}>
              <a
                href="https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.125rem',
                  color: 'var(--fg1)',
                  textDecoration: 'underline'
                }}
              >
                {`NYO-USA 2019 R. Strauss's "Eine Alpensinfonie"`}
                <ArrowUpRight size={10} style={{ flexShrink: 0 }} />
              </a>
            </li>
          </ul>

          <hr style={{
            border: 'none',
            borderTop: '1px solid var(--bg3)',
            marginTop: '3rem',
            marginBottom: '1.5rem'
          }} />

          <div style={{
            fontSize: '1rem',
            color: 'var(--fg2)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '500',
              marginTop: 0,
              marginBottom: '0.5rem',
              color: 'var(--fg1)'
            }}>
             Let's chat
            </h2>
            <div>
              <a 
                href="#" 
                style={{ 
                  color: 'var(--fg1)', 
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.125rem'
                }}
              >
                Email
                <ArrowUpRight size={10} style={{ flexShrink: 0 }} />
              </a>
              {`, `}
              <a 
                href="#" 
                style={{ 
                  color: 'var(--fg1)', 
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.125rem'
                }}
              >
                Threads
                <ArrowUpRight size={10} style={{ flexShrink: 0 }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

