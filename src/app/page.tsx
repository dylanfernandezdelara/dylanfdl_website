import type { Metadata } from 'next'
import { Fragment } from 'react'

import CardGridClient from '@/components/CardGridClient'
import ExternalLink from '@/components/ExternalLink'
import HomeWorkIndex from '@/components/HomeWorkIndex'
import JsonLdScript from '@/components/JsonLdScript'
import OptimistText from '@/components/OptimistText'
import PageSearchPaletteHost from '@/components/PageSearchPaletteHost'
import ThemeToggle from '@/components/ThemeToggle'
import { buildCardGridItems } from '@/lib/buildCardGridItems'
import { buildHomePageJsonLd } from '@/lib/jsonLd'
import { CONTACT_LINK_STYLES, SECONDARY_LINK_SEPARATOR } from '@/lib/linkStyles'
import {
  CONTACT_LINKS,
  DEFAULT_DESCRIPTION,
  HOME_PAGE_TITLE,
  OPEN_GRAPH_BASE,
  PERSON_LOCATION,
  PERSON_NAME,
  SITE_DOCUMENT_LINKS,
  absoluteUrl,
} from '@/lib/site'
import {
  HOME_ABOUT_HEADING,
  HOME_DETAIL_PARAGRAPHS,
  HOME_PROFILE_HEADING,
  HOME_SHARED_INTRO_PARAGRAPHS,
  HOME_WORK_HEADING,
  HOME_WORK_INTRO,
} from '@/lib/siteCopy'

const cardGridItems = buildCardGridItems()

const INTRO_LINKS = {
  museSparkAnnouncement:
    'https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/',
  museSpark12AndMuseCode:
    'https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2',
  aiGlasses: 'https://www.meta.com/ai-glasses/',
} as const

const canonicalUrl = absoluteUrl('/')

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
      <article className="mx-auto max-w-4xl px-4 pt-20 text-base leading-[1.6] min-[481px]:px-6 md:px-8 md:pt-16">
        <div className="text-pretty text-sm font-[450] leading-relaxed text-fg1 min-[640px]:max-w-[75%] [&_h1]:mb-6 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-normal [&_h1]:text-fg0 [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-normal [&_h2]:text-fg0 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-normal [&_h3]:text-fg0">
          <h1>{PERSON_NAME}</h1>
          <h2>{HOME_PROFILE_HEADING}</h2>
          <p className="mb-4">
            I am an{'\u00A0'}<OptimistText />
          </p>
          <p className="mb-4">
            I currently work on post-training at{' '}
            <ExternalLink allowWrap href={INTRO_LINKS.museSparkAnnouncement}>Meta</ExternalLink> and build
            RL environments for frontier coding agents. We recently launched{' '}
            <ExternalLink allowWrap href={INTRO_LINKS.museSpark12AndMuseCode}>Muse Spark 1.2</ExternalLink> and{' '}
            <ExternalLink allowWrap href={INTRO_LINKS.museSpark12AndMuseCode}>Muse Code</ExternalLink>.
          </p>

          <p className="mb-4">
            Previously, I scaled crash infrastructure for {' '}
            <ExternalLink allowWrap href={INTRO_LINKS.aiGlasses}>Meta Glasses</ExternalLink>.
          </p>

          <p className="mb-4">
            I am a Yale graduate and am currently based in {PERSON_LOCATION.locality}.
          </p>
          {HOME_SHARED_INTRO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph} className="mb-4">
              {paragraph}
            </p>
          ))}

          <h2>{HOME_WORK_HEADING}</h2>
          <p className="mb-4">{HOME_WORK_INTRO}</p>
          <HomeWorkIndex items={cardGridItems} />

          <h2>{HOME_ABOUT_HEADING}</h2>
          {HOME_DETAIL_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <CardGridClient items={cardGridItems} />
        <hr className="mb-3 mt-8 w-full border-0 border-t border-bg3 min-[481px]:mb-4 md:mb-6" />

        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex max-w-reading flex-wrap items-baseline gap-2 text-sm">
            {CONTACT_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 && (
                  <span className={SECONDARY_LINK_SEPARATOR} aria-hidden="true">
                    ·
                  </span>
                )}
                <a className={CONTACT_LINK_STYLES} href={link.href}>
                  {link.label}
                </a>
              </Fragment>
            ))}
            {SITE_DOCUMENT_LINKS.map((link) => (
              <Fragment key={link.href}>
                <span className={SECONDARY_LINK_SEPARATOR} aria-hidden="true">
                  ·
                </span>
                <a className={CONTACT_LINK_STYLES} href={link.href}>
                  {link.label}
                </a>
              </Fragment>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </article>
      <PageSearchPaletteHost />
    </>
  )
}
