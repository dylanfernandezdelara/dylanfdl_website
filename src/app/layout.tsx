import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { GeistMono } from 'geist/font/mono'
import { Lora } from 'next/font/google'

import {
  DEFAULT_DESCRIPTION,
  HOME_PAGE_TITLE,
  OPEN_GRAPH_BASE,
  PERSON_NAME,
  REL_ME_URLS,
  SITE_URL,
  TWITTER_CREATOR,
} from '@/lib/site'

import '../styles/theme.css'
import '../styles/globals.css'
import '../styles/effects.css'
import '@stylexswc/webpack-plugin/stylex.css'

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
})

const styles = stylex.create({
  html: {
    fontFamily: 'var(--font-sans)',
  },
  main: {
    paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
    '@media (min-width: 481px)': {
      paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))',
    },
    '@media (min-width: 768px)': {
      paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 0px))',
      paddingTop: '2rem',
    },
  },
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_PAGE_TITLE,
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: PERSON_NAME }],
  openGraph: {
    ...OPEN_GRAPH_BASE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: TWITTER_CREATOR,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

const themeInitScript = `(function () {
  try {
    var t = localStorage.getItem('theme')
    document.documentElement.classList.remove('light', 'dark')
    if (t === 'dark') document.documentElement.classList.add('dark')
    else if (t === 'light') document.documentElement.classList.add('light')
  } catch {
    void 0
  }
})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  const htmlSx = stylex.props(styles.html)

  return (
    <html
      lang="en"
      className={`${GeistMono.variable} ${lora.variable}${htmlSx.className ? ` ${htmlSx.className}` : ''}`}
      style={htmlSx.style}
      suppressHydrationWarning
    >
      <head>
        {REL_ME_URLS.map((profileUrl) => (
          <link key={profileUrl} rel="me" href={profileUrl} />
        ))}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <main {...stylex.props(styles.main)}>{children}</main>
      </body>
    </html>
  )
}
