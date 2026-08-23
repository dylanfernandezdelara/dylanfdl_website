import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { APEX_HOST, SITE_URL } from './site.config.mjs'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: APEX_HOST }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      // Astro @astrojs/sitemap used these URLs; keep crawlers from 404ing.
      {
        source: '/sitemap-index.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/sitemap-0.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/notes/purpose-of-writing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/essays/purpose-of-writing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/essays/:slug',
        destination: '/notes/:slug',
        permanent: true,
      },
    ]
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light',
            dark: 'github-dark',
          },
          keepBackground: false,
        },
      ],
    ],
  },
})

export default withMDX(nextConfig)
