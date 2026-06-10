import type { APIRoute } from 'astro'

import { SITEMAP_INDEX_URL } from '@/lib/site'

export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${SITEMAP_INDEX_URL}\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
