import Header from '@/components/Header'

export default function Home() {
  return (
    <>
      <Header />

      <div className="content-wrapper" style={{
        paddingTop: '2rem',
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

