import Header from '@/components/Header'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
  title: 'Projects',
}

const CONTENT_WRAPPER_STYLE: CSSProperties = {
  paddingTop: '3rem',
  paddingBottom: '4rem',
}

const CONTENT_STYLE: CSSProperties = {
  fontSize: '1rem',
  lineHeight: '1.6',
}

const PARAGRAPH_STYLE: CSSProperties = {
  marginBottom: '1.5rem',
  color: 'var(--fg1)',
}

export default function Projects() {
  return (
    <>
      <Header active="projects" />

      <div className="content-wrapper" style={CONTENT_WRAPPER_STYLE}>
        <div style={CONTENT_STYLE}>
          <p style={PARAGRAPH_STYLE}>
            Projects coming soon.
          </p>
        </div>
      </div>
    </>
  )
}
