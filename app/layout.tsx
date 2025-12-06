import type { Metadata, Viewport } from 'next'
import './globals.css'

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
          <span className="vim-status-left">dfdl</span>
          <span className="vim-status-right" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <a 
              href="mailto:[your-email@example.com]" 
              style={{ 
                color: 'var(--fg3)', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </a>
            <a 
              href="https://www.threads.net/@[your-username]" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: 'var(--fg3)', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ flexShrink: 0 }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12.1662 23C8.82991 22.9777 6.26436 21.8952 4.5408 19.7826C3.00702 17.9026 2.21587 15.2868 2.18929 12.0077L2.18921 12L2.18929 11.9923C2.21587 8.71321 3.00702 6.09736 4.5408 4.21738C6.26436 2.10475 8.82995 1.02228 12.1662 1.00008L12.1729 1L12.1796 1.00008C14.7374 1.0171 16.8775 1.66385 18.5404 2.9223C20.1034 4.10512 21.2036 5.79151 21.8108 7.93463L19.91 8.45572C18.8817 4.82587 16.2786 2.97054 12.1729 2.94118C9.46243 2.96052 7.4125 3.79869 6.07968 5.43235C4.83157 6.96218 4.18655 9.17184 4.16249 12C4.18655 14.8282 4.83157 17.0378 6.07968 18.5676C7.4125 20.2013 9.46243 21.0395 12.1729 21.0589C14.6165 21.0416 16.2334 20.481 17.5785 19.1853C19.1137 17.7063 19.0851 15.8921 18.5941 14.788C18.3046 14.1372 17.78 13.5959 17.072 13.1849C16.8937 14.4223 16.4934 15.427 15.8755 16.1837C15.0505 17.1942 13.8815 17.7463 12.4008 17.8247C11.2802 17.8838 10.2011 17.6231 9.36368 17.09C8.37311 16.4593 7.79341 15.4941 7.73143 14.3721C7.67115 13.281 8.11065 12.2778 8.96901 11.5474C9.78969 10.8491 10.9441 10.4399 12.3075 10.3642C13.3124 10.3083 14.2524 10.3522 15.1214 10.4949C15.006 9.81437 14.773 9.27512 14.4245 8.88494C13.9459 8.34895 13.2061 8.07412 12.2257 8.06805C11.437 8.06588 10.3506 8.26895 9.66173 9.27675L8.02429 8.19362C8.94282 6.84987 10.4359 6.11446 12.2381 6.12703C15.2154 6.14537 16.9886 7.93667 17.1647 11.0656C17.2658 11.1074 17.3656 11.1512 17.4639 11.1966C18.8532 11.8391 19.8691 12.812 20.4018 14.01C21.1446 15.6804 21.2125 18.4013 18.9591 20.5721C17.2367 22.2314 15.1459 22.9802 12.1796 23H12.1662ZM13.1069 12.2828C12.8817 12.2828 12.6523 12.2892 12.4187 12.3022C10.7075 12.3972 9.64104 13.1683 9.70172 14.2667C9.76527 15.4167 11.0551 15.9514 12.2948 15.8864C13.436 15.8259 14.921 15.3893 15.1698 12.4848C14.5398 12.3521 13.8474 12.2828 13.1069 12.2828Z" 
                  fill="currentColor"
                />
              </svg>
            </a>
          </span>
        </div>
      </body>
    </html>
  )
}

