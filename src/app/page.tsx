import type { Metadata } from 'next'
import { Fragment } from 'react'
import * as stylex from '@stylexjs/stylex'

import CardGridClient from '@/components/CardGridClient'
import ExternalLink from '@/components/ExternalLink'
import JsonLdScript from '@/components/JsonLdScript'
import OptimistText from '@/components/OptimistText'
import PageSearchPaletteHost from '@/components/PageSearchPaletteHost'
import ThemeToggle from '@/components/ThemeToggle'
import { buildCardGridItems } from '@/lib/buildCardGridItems'
import { buildHomePageJsonLd } from '@/lib/jsonLd'
import { linkStyles } from '@/lib/linkStyles'
import {
  CONTACT_LINKS,
  DEFAULT_DESCRIPTION,
  HOME_PAGE_TITLE,
  OPEN_GRAPH_BASE,
  absoluteUrl,
} from '@/lib/site'

const cardGridItems = buildCardGridItems()

const INTRO_LINKS = {
  meta: 'https://ai.meta.com',
  museSpark12AndMuseCode:
    'https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2',
  aiGlasses: 'https://www.meta.com/ai-glasses/',
} as const

const canonicalUrl = absoluteUrl('/')

const styles = stylex.create({
  page: {
    marginInline: 'auto',
    maxWidth: '56rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '5rem',
    fontSize: '1rem',
    lineHeight: 1.6,
    '@media (min-width: 481px)': {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    },
    '@media (min-width: 768px)': {
      paddingLeft: '2rem',
      paddingRight: '2rem',
      paddingTop: '4rem',
    },
  },
  intro: {
    textWrap: 'pretty',
    fontSize: '0.875rem',
    fontWeight: 450,
    lineHeight: 1.625,
    color: 'var(--fg1)',
    '@media (min-width: 640px)': {
      maxWidth: '75%',
    },
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
  rule: {
    marginBottom: '0.75rem',
    marginTop: '2rem',
    width: '100%',
    borderWidth: 0,
    borderTopWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--bg3)',
    '@media (min-width: 481px)': {
      marginBottom: '1rem',
    },
    '@media (min-width: 768px)': {
      marginBottom: '1.5rem',
    },
  },
  footer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  contacts: {
    display: 'flex',
    maxWidth: '65ch',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    types: {
      'text/markdown': '/',
    },
  },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    type: 'website',
    title: HOME_PAGE_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: canonicalUrl,
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLdScript
        data={buildHomePageJsonLd({
          canonicalUrl,
          description: DEFAULT_DESCRIPTION,
        })}
      />
      <div {...stylex.props(styles.page)}>
        <div {...stylex.props(styles.intro)}>
          <h1 {...stylex.props(styles.title)}>Dylan Fernandez de Lara</h1>
          <p {...stylex.props(styles.paragraph)}>
            I am an{'\u00A0'}<OptimistText />
          </p>
          <p {...stylex.props(styles.paragraph)}>
            I currently work on post-training at{' '}
            <ExternalLink allowWrap href={INTRO_LINKS.meta}>Meta</ExternalLink> and build
            RL environments for frontier coding agents. We recently launched{' '}
            <ExternalLink allowWrap href={INTRO_LINKS.museSpark12AndMuseCode}>Muse Spark 1.2</ExternalLink> and{' '}
            <ExternalLink allowWrap href={INTRO_LINKS.museSpark12AndMuseCode}>Muse Code</ExternalLink>.
          </p>

          <p {...stylex.props(styles.paragraph)}>
            Previously, I scaled crash infrastructure for {' '}
            <ExternalLink allowWrap href={INTRO_LINKS.aiGlasses}>Meta Glasses</ExternalLink>.
          </p>

          <p {...stylex.props(styles.paragraph)}>
            I am a Yale graduate and am currently based in New York.
          </p>

        </div>

        <CardGridClient items={cardGridItems}>
          <hr {...stylex.props(styles.rule)} />

          <div {...stylex.props(styles.footer)}>
            <div {...stylex.props(styles.contacts)}>
              {CONTACT_LINKS.map((link, index) => (
                <Fragment key={link.href}>
                  {index > 0 && (
                    <span {...stylex.props(linkStyles.secondarySeparator)} aria-hidden="true">
                      ·
                    </span>
                  )}
                  <a {...stylex.props(linkStyles.contact)} href={link.href}>
                    {link.label}
                  </a>
                </Fragment>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </CardGridClient>
      </div>
      <PageSearchPaletteHost />
    </>
  )
}
