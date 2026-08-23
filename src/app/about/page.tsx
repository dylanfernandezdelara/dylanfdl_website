import SiteDocumentView from '@/components/SiteDocumentView'
import { ABOUT_DOCUMENT, siteDocumentMetadata } from '@/lib/siteDocuments'

export const metadata = siteDocumentMetadata(ABOUT_DOCUMENT)

export default function AboutPage() {
  return <SiteDocumentView document={ABOUT_DOCUMENT} />
}
