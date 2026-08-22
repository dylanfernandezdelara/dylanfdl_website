import type { Metadata } from 'next'

import InfoPage, { InfoParagraph } from '@/components/InfoPage'
import {
  PRIVACY_PAGE_PARAGRAPHS,
  PRIVACY_PAGE_TITLE,
} from '@/lib/siteCopy'
import { OPEN_GRAPH_BASE, PRIVACY_PATH, absoluteUrl, buildPageTitle } from '@/lib/site'

const canonicalUrl = absoluteUrl(PRIVACY_PATH)
const description = PRIVACY_PAGE_PARAGRAPHS[0]

export const metadata: Metadata = {
  title: buildPageTitle({ title: PRIVACY_PAGE_TITLE }),
  description,
  alternates: {
    canonical: PRIVACY_PATH,
    types: {
      'text/markdown': PRIVACY_PATH,
    },
  },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    type: 'website',
    title: buildPageTitle({ title: PRIVACY_PAGE_TITLE }),
    description,
    url: canonicalUrl,
  },
}

export default function PrivacyPage() {
  return (
    <InfoPage title={PRIVACY_PAGE_TITLE} canonicalUrl={canonicalUrl} description={description}>
      {PRIVACY_PAGE_PARAGRAPHS.map((paragraph) => (
        <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
      ))}
    </InfoPage>
  )
}
