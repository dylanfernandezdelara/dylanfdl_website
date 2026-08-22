import InfoPage, { InfoParagraph } from '@/components/InfoPage'
import { documentPageMetadata } from '@/lib/documentPage'
import { ABOUT_PATH, absoluteUrl } from '@/lib/site'
import { ABOUT_PAGE_PARAGRAPHS, ABOUT_PAGE_TITLE } from '@/lib/siteCopy'

const description = ABOUT_PAGE_PARAGRAPHS[0] ?? ABOUT_PAGE_TITLE

export const metadata = documentPageMetadata({
  path: ABOUT_PATH,
  title: ABOUT_PAGE_TITLE,
  description,
})

export default function AboutPage() {
  return (
    <InfoPage title={ABOUT_PAGE_TITLE} canonicalUrl={absoluteUrl(ABOUT_PATH)} description={description}>
      {ABOUT_PAGE_PARAGRAPHS.map((paragraph) => (
        <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
      ))}
    </InfoPage>
  )
}
