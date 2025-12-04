import Link from 'next/link'

export default function About() {
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
          <Link href="/about" style={{ color: 'var(--aqua)', fontWeight: '700' }}>About</Link>
          <Link href="/writing" style={{ color: 'var(--fg3)', fontWeight: '700' }}>Writing</Link>
        </nav>
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
            {`Hi, I am Dylan.`}
          </p>

          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
            {`I am an optimist and believe that technology can be used for good. I am in staunch opposition to the idea that the learning
            rate of humans goes down as we age. The invariant of my life is that unencumbered learning, and intense focus, drive forward
            my whimsy and wonder for the world.`}
          </p>
          
          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
            {`I am a Yale graduate and based in New York. I am an engineer with a generalist focus on systems, 
            and I currently work in Core OS in Wearables at Meta Reality Labs. My recent work involves training ML models
            to reduce crashes in our lab, and scaling a symbolication service to support an increasing number of devices 
            and core dump formats.`}
          </p>

          <p style={{ marginBottom: '1.5rem', color: 'var(--fg1)' }}>
            {`I am a violinist, and perform regularly in New York. This season I will be playing three concerts with the National Youth 
            Orchestra of the USA Alumni Chamber Orchestra.`}
          </p>
        </div>
      </div>
    </>
  )
}

