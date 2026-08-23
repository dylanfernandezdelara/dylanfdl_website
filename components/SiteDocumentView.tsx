import type { ReactNode } from 'react'
import Link from 'next/link'

import ExternalLink from '@/components/ExternalLink'
import JsonLdScript from '@/components/JsonLdScript'
import { buildDocumentPageJsonLd } from '@/lib/jsonLd'
import { INLINE_LINK_STYLES } from '@/lib/linkStyles'
import { PERSON_NAME, absoluteUrl } from '@/lib/site'
import type { SiteDocument } from '@/lib/siteDocuments'

function InfoParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-4">{children}</p>
}

export default function SiteDocumentView({ document }: { document: SiteDocument }) {
  const description = document.paragraphs[0]

  return (
    <>
      <JsonLdScript
        data={buildDocumentPageJsonLd({
          canonicalUrl: absoluteUrl(document.path),
          name: document.title,
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
          <h1 className="mb-6 font-serif text-2xl font-normal text-fg0">{document.title}</h1>
          {document.paragraphs.map((paragraph) => (
            <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
          ))}
          {document.sections?.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 mt-8 font-serif text-lg font-normal text-fg0">{section.heading}</h2>
              <ul className="mb-4 space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('mailto:') ? (
                      <a href={link.href} className={INLINE_LINK_STYLES}>
                        {link.label}
                      </a>
                    ) : (
                      <ExternalLink href={link.href}>{link.label}</ExternalLink>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </div>
    </>
  )
}
