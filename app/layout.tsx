import type { Metadata, Viewport } from 'next'
import Script from 'next/script'

import ThemeToggle from '@/components/ThemeToggle'

import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s — Dylan Fernandez de Lara',
    default: 'dfdl',
  },
  description: 'Personal website',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover', // Support for iOS notch
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.remove('light','dark');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.add('light');}catch(e){}})()`}
        </Script>
        <main className="pb-16 min-[481px]:pb-14 md:pb-12 md:pt-8">{children}</main>
        <ThemeToggle />
      </body>
    </html>
  )
}
