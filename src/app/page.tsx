import type { Metadata } from 'next'
import { Fragment } from 'react'

import CardGridClient from '@/components/CardGridClient'
import ExternalLink from '@/components/ExternalLink'
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
  EMPLOYER_NAME,
  HOME_INTRO_LINKS,
  HOME_PAGE_TITLE,
  OPEN_GRAPH_BASE,
  PERSON_ROLE,
  absoluteUrl,
} from '@/lib/site'

const cardGridItems = buildCardGridItems()

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
      <div className="mx-auto max-w-4xl px-4 pt-20 text-base leading-6 min-[481px]:px-6 md:px-8 md:pt-16">
        <div className="text-pretty text-sm font-[450] leading-6 text-fg1 min-[640px]:max-w-[39rem]">
          <h1 className="mb-6 font-serif text-2xl font-normal leading-8 text-fg0">Dylan Fernandez de Lara</h1>
          <p className="mb-4">
            I am an{'\u00A0'}<OptimistText />
          </p>
          <p className="mb-4">
            I am a {PERSON_ROLE} at {EMPLOYER_NAME}. Previously, I did post-training at{' '}
            <ExternalLink allowWrap href={HOME_INTRO_LINKS.meta.href}>{HOME_INTRO_LINKS.meta.label}</ExternalLink> and built
            RL environments for frontier coding agents. Before that, I scaled crash infrastructure for{' '}
            <ExternalLink allowWrap href={HOME_INTRO_LINKS.aiGlasses.href}>{HOME_INTRO_LINKS.aiGlasses.label}</ExternalLink>.
          </p>

          <p className="mb-4">
            I am a Yale graduate and am currently based in New York.
          </p>

        </div>

        <CardGridClient items={cardGridItems}>
          <hr className="mb-4 mt-8 w-full border-0 border-t border-bg3 md:mb-6" />

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex max-w-reading flex-wrap items-center gap-2 text-sm leading-6">
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
            </div>
            <ThemeToggle />
          </div>
        </CardGridClient>
      </div>
      <PageSearchPaletteHost />
    </>
  )
}
