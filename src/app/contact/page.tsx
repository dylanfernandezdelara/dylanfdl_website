import type { Metadata } from 'next'

import InfoPage, { InfoLink, InfoParagraph } from '@/components/InfoPage'
import {
  CONTACT_PAGE_PARAGRAPHS,
  CONTACT_PAGE_TITLE,
} from '@/lib/siteCopy'
import {
  CONTACT_LINKS,
  CONTACT_PATH,
  OPEN_GRAPH_BASE,
  absoluteUrl,
  buildPageTitle,
} from '@/lib/site'

const canonicalUrl = absoluteUrl(CONTACT_PATH)
const description = CONTACT_PAGE_PARAGRAPHS[0]

export const metadata: Metadata = {
  title: buildPageTitle({ title: CONTACT_PAGE_TITLE }),
  description,
  alternates: {
    canonical: CONTACT_PATH,
    types: {
      'text/markdown': CONTACT_PATH,
    },
  },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    type: 'website',
    title: buildPageTitle({ title: CONTACT_PAGE_TITLE }),
    description,
    url: canonicalUrl,
  },
}

export default function ContactPage() {
  return (
    <InfoPage title={CONTACT_PAGE_TITLE} canonicalUrl={canonicalUrl} description={description}>
      {CONTACT_PAGE_PARAGRAPHS.map((paragraph) => (
        <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
      ))}
      <h2 className="mb-3 mt-8 font-serif text-lg font-normal text-fg0">Profiles</h2>
      <ul className="mb-4 space-y-1">
        {CONTACT_LINKS.map((link) => (
          <li key={link.href}>
            <InfoLink href={link.href}>{link.label}</InfoLink>
          </li>
        ))}
      </ul>
    </InfoPage>
  )
}
