import type { MDXComponents } from 'mdx/types'

import { articleMdxComponents } from '@/components/article/mdxComponents'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...articleMdxComponents,
    ...components,
  }
}
