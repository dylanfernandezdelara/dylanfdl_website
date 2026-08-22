import type { Metadata } from 'next'
import Link from 'next/link'

import { INLINE_LINK_STYLES } from '@/lib/linkStyles'
import { NOT_FOUND_DESCRIPTION } from '@/lib/site'
import { NOT_FOUND_RECOVERY_LINKS } from '@/lib/siteCopy'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Not found',
  description: NOT_FOUND_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="mx-auto max-w-reading px-4 pt-12 min-[481px]:px-6 md:px-8 md:pt-16">
      <h1 className="mb-4 text-2xl font-bold text-fg0">404</h1>
      <p className="mb-4 leading-[1.6] text-fg2">
        This path does not exist. Try the sitemap, llms.txt, or one of the pages below.
      </p>
      <ul className="mb-8 space-y-2 text-sm">
        {NOT_FOUND_RECOVERY_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={cn(INLINE_LINK_STYLES)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
