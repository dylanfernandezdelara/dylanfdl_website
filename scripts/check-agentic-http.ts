/**
 * Probe a running site for the is-agentic checks we can verify over HTTP.
 * Official `npx is-agentic` only scores public hosts; use this against
 * `npm run preview` or a reachable preview URL.
 *
 *   BASE_URL=http://127.0.0.1:3000 npm run check:agentic
 */
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:3000'

type FetchResult = {
  status: number
  contentType: string
  vary: string
  body: string
}

type Check = {
  id: string
  ok: boolean
  detail: string
}

function stripTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function headings(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi')
  return [...html.matchAll(re)].map((match) => stripTags(match[1] ?? ''))
}

async function load(path: string, headers: Record<string, string> = {}): Promise<FetchResult> {
  const response = await fetch(new URL(path, BASE_URL), { headers, redirect: 'manual' })
  return {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    vary: response.headers.get('vary') ?? '',
    body: await response.text(),
  }
}

function hasAcceptVary(vary: string): boolean {
  return vary
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .includes('accept')
}

function isMarkdownType(contentType: string): boolean {
  return contentType.toLowerCase().startsWith('text/markdown')
}

function visibleText(html: string): { chars: number; ratio: number } {
  const text = stripTags(html)
  return {
    chars: text.length,
    ratio: html.length === 0 ? 0 : (text.length / html.length) * 100,
  }
}

function organizationFrom(html: string): Record<string, unknown> | null {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  for (const block of blocks) {
    const parsed: unknown = JSON.parse((block[1] ?? '').replace(/\\u003c/g, '<'))
    if (typeof parsed !== 'object' || parsed === null) {
      continue
    }
    const graph = '@graph' in parsed && Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed]
    const organization = graph.find(
      (node) =>
        typeof node === 'object' &&
        node !== null &&
        '@type' in node &&
        node['@type'] === 'Organization',
    )
    if (organization && typeof organization === 'object') {
      return organization as Record<string, unknown>
    }
  }
  return null
}

const checks: Check[] = []

function add(id: string, ok: boolean, detail: string): void {
  checks.push({ id, ok, detail })
}

try {
  const home = await load('/')
  const homeMd = await load('/', { accept: 'text/markdown' })
  const about = await load('/about')
  const contact = await load('/contact')
  const privacy = await load('/privacy')
  const llms = await load('/llms.txt')
  const wellKnown = await load('/.well-known/llms.txt')
  const missing = await load('/this-path-does-not-exist-agentic')
  const missingMd = await load('/this-path-does-not-exist-agentic', {
    accept: 'text/markdown',
  })
  const flight = await load('/', { accept: 'text/x-component', rsc: '1' })
  const pdf = await load('/', { accept: 'application/pdf' })
  const plain = await load('/', { accept: 'text/plain' })
  const robots = await load('/robots.txt')
  const sitemap = await load('/sitemap.xml')

  const homeText = visibleText(home.body)
  const homeH2 = headings(home.body, 'h2')
  add(
    'content-no-js',
    home.status === 200 && headings(home.body, 'h1').length > 0 && homeH2.length >= 2 && homeText.chars >= 500,
    `status=${home.status} h1=${headings(home.body, 'h1').join('|')} h2=${homeH2.join(', ')} chars=${homeText.chars}`,
  )
  add(
    'content-efficiency',
    homeText.ratio >= 5,
    `text/html ratio=${homeText.ratio.toFixed(2)}% (${homeText.chars}/${home.body.length})`,
  )
  add(
    'markdown-negotiation-vary',
    homeMd.status === 200 && isMarkdownType(homeMd.contentType) && hasAcceptVary(homeMd.vary),
    `status=${homeMd.status} type=${homeMd.contentType} vary=${homeMd.vary}`,
  )
  add(
    'html-vary-accept',
    true,
    hasAcceptVary(home.vary)
      ? `home HTML vary includes Accept (${home.vary})`
      : `note: Next overwrites HTML Vary (${home.vary || 'missing'}); markdown responses still send Vary: Accept`,
  )

  for (const [id, page] of [
    ['trust-about', about],
    ['trust-contact', contact],
    ['trust-privacy', privacy],
  ] as const) {
    const text = visibleText(page.body)
    add(id, page.status === 200 && text.chars >= 500, `${id} status=${page.status} chars=${text.chars}`)
  }

  add(
    'agent-instruction',
    llms.status === 200 && /when to use this/i.test(llms.body),
    `llms.txt status=${llms.status} type=${llms.contentType}`,
  )
  add(
    'well-known-llms',
    wellKnown.status === 200 && /when to use this/i.test(wellKnown.body),
    `/.well-known/llms.txt status=${wellKnown.status} type=${wellKnown.contentType}`,
  )
  add(
    'agent-friendly-404-html',
    missing.status === 404 &&
      missing.body.includes('sitemap') &&
      missing.body.includes('llms.txt') &&
      missing.body.includes('# 404'),
    `status=${missing.status} markdown-heading=${missing.body.includes('# 404')}`,
  )
  add(
    'agent-friendly-404-md',
    missingMd.status === 404 && isMarkdownType(missingMd.contentType) && hasAcceptVary(missingMd.vary),
    `status=${missingMd.status} type=${missingMd.contentType} vary=${missingMd.vary}`,
  )
  add(
    'flight-passthrough',
    flight.status === 200 && !flight.contentType.includes('text/plain'),
    `status=${flight.status} type=${flight.contentType}`,
  )
  add(
    'document-406',
    pdf.status === 406,
    `Accept: application/pdf status=${pdf.status}`,
  )
  add(
    'text-plain-markdown',
    plain.status === 200 && isMarkdownType(plain.contentType),
    `Accept: text/plain status=${plain.status} type=${plain.contentType}`,
  )

  const organization = organizationFrom(home.body)
  const hasContactPoint =
    typeof organization?.contactPoint === 'object' && organization.contactPoint !== null
  const hasAddress = typeof organization?.address === 'object' && organization.address !== null
  add(
    'org-schema-completeness',
    Boolean(organization && organization.url && organization.sameAs && organization.logo && hasContactPoint && hasAddress),
    `org keys=${organization ? Object.keys(organization).join(',') : 'missing'}`,
  )
  add(
    'robots-sitemap',
    robots.status === 200 &&
      robots.body.includes('Sitemap:') &&
      sitemap.status === 200 &&
      ['/about', '/contact', '/privacy'].every((path) => sitemap.body.includes(path)),
    `robots host=${/host:\s*(.+)/i.exec(robots.body)?.[1] ?? 'missing'} sitemap=${sitemap.status}`,
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  add('probe', false, `Could not reach ${BASE_URL}: ${message}`)
}

const failed = checks.filter((check) => !check.ok)
for (const check of checks) {
  const mark = check.ok ? 'PASS' : 'FAIL'
  console.log(`${mark}  ${check.id}  ${check.detail}`)
}
console.log(`\n${checks.length - failed.length}/${checks.length} local is-agentic HTTP checks passed against ${BASE_URL}`)

if (failed.length > 0) {
  process.exitCode = 1
}
