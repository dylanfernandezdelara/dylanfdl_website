import Link from 'next/link'
import type { CSSProperties } from 'react'

const CONTENT_WRAPPER_STYLE: CSSProperties = {
  paddingTop: '3rem',
  paddingBottom: '4rem',
}

const ERROR_TITLE_STYLE: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '700',
  marginBottom: '1rem',
  color: 'var(--red)',
}

const ERROR_MESSAGE_STYLE: CSSProperties = {
  color: 'var(--fg2)',
  marginBottom: '2rem',
  lineHeight: '1.6',
}

const BACK_LINK_STYLE: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--blue)',
}

export default function NotFound() {
  return (
    <>
      <div className="content-wrapper" style={CONTENT_WRAPPER_STYLE}>
        <h1 style={ERROR_TITLE_STYLE}>
          404
        </h1>
        <p style={ERROR_MESSAGE_STYLE}>
          Page not found.
        </p>
        <Link href="/" style={BACK_LINK_STYLE}>
          ← Back to Home
        </Link>
      </div>
    </>
  )
}

