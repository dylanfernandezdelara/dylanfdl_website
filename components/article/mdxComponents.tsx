import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef } from 'react'
import * as stylex from '@stylexjs/stylex'

import ArticleHeading from '@/components/article/ArticleHeading'
import ArticleImage from '@/components/article/ArticleImage'
import ArticleVideo from '@/components/article/ArticleVideo'
import BrowserFrame from '@/components/article/BrowserFrame'
import Callout from '@/components/article/Callout'
import CodeBlock from '@/components/article/CodeBlock'
import Figure from '@/components/article/Figure'
import { linkStyles } from '@/lib/linkStyles'
import { withClassName } from '@/lib/sx'

function isExternalHref(href: string | undefined): boolean {
  return Boolean(href && /^https?:\/\//.test(href))
}

function Anchor(props: ComponentPropsWithoutRef<'a'>) {
  const { href, className, children, ...rest } = props
  const external = isExternalHref(href)

  return (
    <a
      href={href}
      {...withClassName(className, stylex.props(linkStyles.inline))}
      {...(external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      {...rest}
    >
      {children}
      {external ? <span className="sr-only"> (opens in new tab)</span> : null}
    </a>
  )
}

export const articleMdxComponents: MDXComponents = {
  h2: (props) => <ArticleHeading as="h2" {...props} />,
  h3: (props) => <ArticleHeading as="h3" {...props} />,
  h4: (props) => <ArticleHeading as="h4" {...props} />,
  a: Anchor,
  pre: CodeBlock,
  img: (props) => {
    const { src, alt = '', width, height, className } = props
    if (!src || typeof src !== 'string') {
      return null
    }
    return (
      <ArticleImage
        src={src}
        alt={alt}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className={typeof className === 'string' ? className : undefined}
      />
    )
  },
  Figure,
  ArticleImage,
  ArticleVideo,
  Callout,
  BrowserFrame,
}
