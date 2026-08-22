import type { Metadata } from 'next'

import InfoPage, { InfoParagraph } from '@/components/InfoPage'
import {
  ABOUT_PAGE_PARAGRAPHS,
  ABOUT_PAGE_TITLE,
} from '@/lib/siteCopy'
import { ABOUT_PATH, OPEN_GRAPH_BASE, absoluteUrl, buildPageTitle } from '@/lib/site'

const canonicalUrl = absoluteUrl(ABOUT_PATH)
const description = ABOUT_PAGE_PARAGRAPHS[0]

export const metadata: Metadata = {
  title: buildPageTitle({ title: ABOUT_PAGE_TITLE }),
  description,
  alternates: {
    canonical: ABOUT_PATH,
    types: {
      'text/markdown': ABOUT_PATH,
    },
  },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    type: 'website',
    title: buildPageTitle({ title: ABOUT_PAGE_TITLE }),
    description,
    url: canonicalUrl,
  },
}

export default function AboutPage() {
  return (
    <InfoPage title={ABOUT_PAGE_TITLE} canonicalUrl={canonicalUrl} description={description}>
      {ABOUT_PAGE_PARAGRAPHS.map((paragraph) => (
        <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
      ))}
    </InfoPage>
  )
}
