import SiteDocumentView from '@/components/SiteDocumentView'
import { CONTACT_DOCUMENT, siteDocumentMetadata } from '@/lib/siteDocuments'

export const metadata = siteDocumentMetadata(CONTACT_DOCUMENT)

export default function ContactPage() {
  return <SiteDocumentView document={CONTACT_DOCUMENT} />
}
