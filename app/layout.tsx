import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Dylan Fernandez de Lara',
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
    <html lang="en" data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body>
        <main>{children}</main>
        <div className="vim-status-bar">
          <div className="vim-status-left">
            <ThemeToggle />
          </div>
          <span className="vim-status-right">dfdl</span>
        </div>
      </body>
    </html>
  )
}

