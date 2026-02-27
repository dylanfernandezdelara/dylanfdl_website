import type { Metadata, Viewport } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>
        <main className="flex-1 pb-16 min-[481px]:pb-14 md:pb-12 md:pt-8">{children}</main>
      </body>
    </html>
  )
}
