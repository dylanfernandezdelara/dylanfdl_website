import type { CSSProperties } from 'react'

const CONTENT_WRAPPER_STYLE: CSSProperties = {
  paddingTop: '3rem',
  paddingBottom: '4rem',
}

const INTRO_TEXT_STYLE: CSSProperties = {
  fontSize: '1rem',
  lineHeight: '1.6',
  marginBottom: '1.5rem',
  color: 'var(--fg1)',
}

export default function Home() {
  return (
    <>
      <div className="content-wrapper" style={CONTENT_WRAPPER_STYLE}>
        <p style={INTRO_TEXT_STYLE}>
          [A brief introduction or statement about yourself. This should feel personal and direct, not like a tagline.]
        </p>
      </div>
    </>
  )
}

