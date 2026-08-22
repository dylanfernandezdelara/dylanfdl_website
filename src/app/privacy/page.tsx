import InfoPage, { InfoParagraph } from '@/components/InfoPage'
import { documentPageMetadata } from '@/lib/documentPage'
import { PRIVACY_PATH, absoluteUrl } from '@/lib/site'
import { PRIVACY_PAGE_PARAGRAPHS, PRIVACY_PAGE_TITLE } from '@/lib/siteCopy'

const description = PRIVACY_PAGE_PARAGRAPHS[0] ?? PRIVACY_PAGE_TITLE

export const metadata = documentPageMetadata({
  path: PRIVACY_PATH,
  title: PRIVACY_PAGE_TITLE,
  description,
})

export default function PrivacyPage() {
  return (
    <InfoPage
      title={PRIVACY_PAGE_TITLE}
      canonicalUrl={absoluteUrl(PRIVACY_PATH)}
      description={description}
    >
      {PRIVACY_PAGE_PARAGRAPHS.map((paragraph) => (
        <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
      ))}
    </InfoPage>
  )
}
