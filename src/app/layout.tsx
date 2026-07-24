import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
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
import '../styles/article.css'
import '../styles/effects.css'

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_PAGE_TITLE,
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: PERSON_NAME }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/favicon-poppy-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-poppy-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: {
      url: '/apple-touch-icon-poppy.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
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
  return (
    <html
      lang="en"
      className={`${GeistMono.variable} ${lora.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        {REL_ME_URLS.map((profileUrl) => (
          <link key={profileUrl} rel="me" href={profileUrl} />
        ))}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <main className="pb-safe min-[481px]:pb-safe-8 md:pb-safe-10 md:pt-8">{children}</main>
      </body>
    </html>
  )
}
