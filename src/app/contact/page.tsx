import ExternalLink from '@/components/ExternalLink'
import InfoPage, { InfoParagraph } from '@/components/InfoPage'
import { documentPageMetadata } from '@/lib/documentPage'
import { INLINE_LINK_STYLES } from '@/lib/linkStyles'
import { CONTACT_LINKS, CONTACT_PATH, absoluteUrl } from '@/lib/site'
import { CONTACT_PAGE_PARAGRAPHS, CONTACT_PAGE_TITLE } from '@/lib/siteCopy'

const description = CONTACT_PAGE_PARAGRAPHS[0] ?? CONTACT_PAGE_TITLE

export const metadata = documentPageMetadata({
  path: CONTACT_PATH,
  title: CONTACT_PAGE_TITLE,
  description,
})

export default function ContactPage() {
  return (
    <InfoPage
      title={CONTACT_PAGE_TITLE}
      canonicalUrl={absoluteUrl(CONTACT_PATH)}
      description={description}
    >
      {CONTACT_PAGE_PARAGRAPHS.map((paragraph) => (
        <InfoParagraph key={paragraph}>{paragraph}</InfoParagraph>
      ))}
      <h2 className="mb-3 mt-8 font-serif text-lg font-normal text-fg0">Profiles</h2>
      <ul className="mb-4 space-y-1">
        {CONTACT_LINKS.map((link) => (
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
    </InfoPage>
  )
}
