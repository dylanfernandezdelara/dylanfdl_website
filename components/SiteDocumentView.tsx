import type { ReactNode } from 'react'
import Link from 'next/link'
import * as stylex from '@stylexjs/stylex'

import ExternalLink from '@/components/ExternalLink'
import JsonLdScript from '@/components/JsonLdScript'
import { buildDocumentPageJsonLd } from '@/lib/jsonLd'
import { linkStyles } from '@/lib/linkStyles'
import { PERSON_NAME, absoluteUrl } from '@/lib/site'
import type { SiteDocument } from '@/lib/siteDocuments'

const styles = stylex.create({
  page: {
    marginInline: 'auto',
    maxWidth: '65ch',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '3rem',
    fontSize: '1rem',
    lineHeight: 1.6,
    '@media (min-width: 481px) and (max-width: 767px)': {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    },
    '@media (min-width: 768px)': {
      paddingLeft: '2rem',
      paddingRight: '2rem',
      paddingTop: '4rem',
    },
  },
  header: {
    marginBottom: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  brand: {
    fontFamily: 'var(--font-lora), ui-serif, Georgia, serif',
    fontWeight: 400,
    color: 'var(--fg0)',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--fg2)',
    },
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    color: 'var(--fg3)',
  },
  navLink: {
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--fg0)',
    },
  },
  article: {
    textWrap: 'pretty',
    fontSize: '0.875rem',
    fontWeight: 450,
    lineHeight: 1.625,
    color: 'var(--fg1)',
  },
  title: {
    marginBottom: '1.5rem',
    fontFamily: 'var(--font-lora), ui-serif, Georgia, serif',
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: 400,
    color: 'var(--fg0)',
  },
  paragraph: {
    marginBottom: '1rem',
  },
  sectionHeading: {
    marginBottom: '0.75rem',
    marginTop: '2rem',
    fontFamily: 'var(--font-lora), ui-serif, Georgia, serif',
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: 400,
    color: 'var(--fg0)',
  },
  list: {
    marginBottom: '1rem',
  },
  listItem: {
    ':not(:first-child)': {
      marginTop: '0.25rem',
    },
  },
})

function InfoParagraph({ children }: { children: ReactNode }) {
  return <p {...stylex.props(styles.paragraph)}>{children}</p>
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
      <div {...stylex.props(styles.page)}>
        <header {...stylex.props(styles.header)}>
          <Link href="/" {...stylex.props(styles.brand)}>
            {PERSON_NAME}
          </Link>
          <nav aria-label="Site" {...stylex.props(styles.nav)}>
            <Link href="/" {...stylex.props(styles.navLink)}>
              Home
            </Link>
          </nav>
        </header>
        <article {...stylex.props(styles.article)}>
          <h1 {...stylex.props(styles.title)}>{document.title}</h1>
          {document.paragraphs.map((paragraph) => (
            <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
          ))}
          {document.sections?.map((section) => (
            <section key={section.heading}>
              <h2 {...stylex.props(styles.sectionHeading)}>{section.heading}</h2>
              <ul {...stylex.props(styles.list)}>
                {section.links.map((link) => (
                  <li key={link.href} {...stylex.props(styles.listItem)}>
                    {link.href.startsWith('mailto:') ? (
                      <a href={link.href} {...stylex.props(linkStyles.inline)}>
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
