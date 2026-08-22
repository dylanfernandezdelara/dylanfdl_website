import type { ReactNode } from 'react'
import Link from 'next/link'

import JsonLdScript from '@/components/JsonLdScript'
import { buildDocumentPageJsonLd } from '@/lib/jsonLd'
import { PERSON_NAME } from '@/lib/site'

type Props = {
  title: string
  canonicalUrl: string
  description: string
  children: ReactNode
}

export default function InfoPage({ title, canonicalUrl, description, children }: Props) {
  return (
    <>
      <JsonLdScript
        data={buildDocumentPageJsonLd({
          canonicalUrl,
          name: title,
          description,
        })}
      />
      <div className="mx-auto max-w-reading px-4 pt-12 text-base leading-[1.6] min-[481px]:px-6 md:px-8 md:pt-16">
        <header className="mb-10 flex items-center justify-between gap-4 text-sm">
          <Link
            href="/"
            className="font-serif font-normal text-fg0 transition-colors duration-150 hover:text-fg2"
          >
            {PERSON_NAME}
          </Link>
          <nav aria-label="Site" className="flex items-center gap-5 text-fg3">
            <Link href="/" className="transition-colors duration-150 hover:text-fg0">
              Home
            </Link>
          </nav>
        </header>
        <article className="text-pretty text-sm font-[450] leading-relaxed text-fg1">
          <h1 className="mb-6 font-serif text-2xl font-normal text-fg0">{title}</h1>
          {children}
        </article>
      </div>
    </>
  )
}

export function InfoParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-4">{children}</p>
}
