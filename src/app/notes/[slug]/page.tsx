import { createContentPage } from '../../_content/createContentPage'

const { dynamicParams, generateStaticParams, generateMetadata, Page } =
  createContentPage('notes')

export { dynamicParams, generateStaticParams, generateMetadata }
export default Page
