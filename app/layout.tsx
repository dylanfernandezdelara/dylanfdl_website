import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: {
    template: '%s — Dylan Fernandez de Lara',
    default: 'dfdl',
  },
  description: 'Personal website',
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
        <Providers>
          <main>{children}</main>
          <div className="vim-status-bar">
            <div className="vim-status-left">
              <span style={{ fontWeight: 'bold' }}>NORMAL</span>
              <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>|</span>
              <span>dylanfdl.com</span>
            </div>
            <div className="vim-status-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ThemeToggle />
              <span style={{ opacity: 0.5 }}>|</span>
              <span>utf-8</span>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
