import { createContentPage } from '../../_content/createContentPage'

const { dynamicParams, generateStaticParams, generateMetadata, Page } =
  createContentPage('projects')

export { dynamicParams, generateStaticParams, generateMetadata }
export default Page
