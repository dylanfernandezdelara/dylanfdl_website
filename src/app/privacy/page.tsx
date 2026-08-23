import SiteDocumentView from '@/components/SiteDocumentView'
import { PRIVACY_DOCUMENT, siteDocumentMetadata } from '@/lib/siteDocuments'

export const metadata = siteDocumentMetadata(PRIVACY_DOCUMENT)

export default function PrivacyPage() {
  return <SiteDocumentView document={PRIVACY_DOCUMENT} />
}
