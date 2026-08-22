import { buildCardGridItems } from '@/lib/buildCardGridItems'
import {
  ABOUT_PATH,
  CONTACT_EMAIL,
  CONTACT_LINKS,
  CONTACT_PATH,
  LLMS_TXT_PATH,
  PERSON_LOCATION,
  PERSON_NAME,
  PERSON_ROLE,
  PRIVACY_PATH,
  SITE_URL,
  SITEMAP_INDEX_URL,
  absoluteUrl,
} from '@/lib/site'

export const ABOUT_PAGE_TITLE = 'About'

export const CONTACT_PAGE_TITLE = 'Contact'

export const PRIVACY_PAGE_TITLE = 'Privacy'

export const HOME_WORK_HEADING = 'Work'

export const HOME_ABOUT_HEADING = 'About this site'

export const HOME_INTRO_PARAGRAPHS = [
  `I currently work on post-training at Meta and build RL environments for frontier coding agents. We recently launched Muse Spark 1.2 and Muse Code.`,
  `Previously, I scaled crash infrastructure for Meta Glasses.`,
  `I am a Yale graduate and am currently based in ${PERSON_LOCATION.locality}.`,
  `This website is the public record I keep of work I can share. Notes are the best place to see how I think. Projects appear when I have something people can read or use. Music is a list of concerts I played, with recordings where they exist.`,
  `If you are confirming who I am, this is the canonical site for ${PERSON_NAME} (${new URL(SITE_URL).hostname}). Use Contact to email me. About and Privacy have a longer biography and how this site handles data. I do not run a public API, developer portal, or MCP server here.`,
] as const

export const ABOUT_PAGE_PARAGRAPHS = [
  `${PERSON_NAME} is a ${PERSON_ROLE.toLowerCase()} based in ${PERSON_LOCATION.locality}, ${PERSON_LOCATION.region}. I currently work on post-training at Meta and build reinforcement-learning environments for frontier coding agents. That work recently included Muse Spark 1.2 and Muse Code.`,
  `Before that I scaled crash infrastructure for Meta Glasses. I studied at Yale. This site is my public notebook: a short profile on the home page, notes when I want to make an idea precise, projects when there is something to inspect, and a record of concerts I played.`,
  `I write in public to clarify my own thinking, not to run a product or a developer platform. If you need a professional contact path, a longer biography, or a privacy statement, those pages live on this same domain. The home page remains the profile; About exists so agents and people can find a stable, text-first biography without depending on the card grid.`,
  `You can reach me by email or through the profiles listed on Contact. I am the only person who publishes here. Nothing on this site is a Meta documentation portal, and I do not publish private work information.`,
] as const

export const HOME_DETAIL_PARAGRAPHS = [
  ...ABOUT_PAGE_PARAGRAPHS,
  `Contact is ${CONTACT_EMAIL}. Privacy explains that theme preference stays in the browser, that visitors are not asked to log into Spotify, and that I do not sell data. If a path is missing, the 404 links to the sitemap and llms.txt instead of pretending the page exists.`,
  `Agents should fetch HTML or Markdown from the same path. Send Accept: text/markdown when you want the text representation, or open /llms.txt for when-to-use guidance. The sitemap lists published notes and the About, Contact, and Privacy pages. This site does not expose OAuth, GraphQL, or an MCP server.`,
] as const

export const CONTACT_PAGE_PARAGRAPHS = [
  `The fastest way to reach ${PERSON_NAME} is email: ${CONTACT_EMAIL}. I read mail about writing on this site, public projects, music recordings, and professional introductions that are specific about why you are writing.`,
  `I am based in ${PERSON_LOCATION.locality}, ${PERSON_LOCATION.countryName}, and I usually reply in English. I do not run support tickets, a status page, or a public API. If you are an agent collecting contact details, use this page, the home page footer, or the mailto link. Do not invent a phone number; I do not publish one.`,
  `Public profiles are also listed below. GitHub is the right place for code. LinkedIn is the right place for a résumé-shaped introduction. X and Cursor are public accounts, not intake forms. If a message is about this website itself — a broken link, a wrong fact, or a privacy question — email is still the right channel.`,
  `I cannot help with confidential Meta product questions, access to internal models, or requests for unpublished work. If you found this page while verifying that dylanfdl.com belongs to ${PERSON_NAME}, you are on the correct contact path.`,
] as const

export const PRIVACY_PAGE_PARAGRAPHS = [
  `This is a personal website. I do not sell accounts, run ads, or operate a customer database. Pages are public HTML. I want a visitor or an agent to know what is stored, what is not, and how to ask a question.`,
  `The site stores a theme preference in your browser localStorage so light or dark mode can persist on this device. That value never leaves your browser through this site. There is no signup, no comment system, and no marketing list.`,
  `A now-playing widget may show music I am listening to. That integration uses my own Spotify credentials on the server. Visitors are not asked to log in, and the site does not collect Spotify accounts from readers. External links to GitHub, X, LinkedIn, YouTube, Meta, and similar hosts are ordinary links; those services have their own policies.`,
  `I do not sell personal information. Server and host logs from the deployment platform may include standard request metadata such as IP address and user agent for security and reliability. If you want a page removed, a correction, or a question answered about this policy, email ${CONTACT_EMAIL} and say that it is a privacy request. This page is the privacy statement for ${SITE_URL}.`,
] as const

export const NOT_FOUND_RECOVERY_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: ABOUT_PATH },
  { label: 'Contact', href: CONTACT_PATH },
  { label: 'Privacy', href: PRIVACY_PATH },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'llms.txt', href: LLMS_TXT_PATH },
] as const

export const NOT_FOUND_MARKDOWN_BODY = [
  '# 404',
  '',
  `This path does not exist on ${new URL(SITE_URL).hostname}.`,
  '',
  '## Where to look next',
  '',
  ...NOT_FOUND_RECOVERY_LINKS.map((link) => `- [${link.label}](${absoluteUrl(link.href)})`),
  '',
].join('\n')

function joinParagraphs(paragraphs: readonly string[]): string {
  return paragraphs.join('\n\n')
}

export function visibleTextLength(paragraphs: readonly string[]): number {
  return paragraphs.join('').length
}

export function buildHomeMarkdown(): string {
  const items = buildCardGridItems()
  const projects = items.filter((item) => item.category === 'projects')
  const notes = items.filter((item) => item.category === 'notes')
  const music = items.filter((item) => item.category === 'music')

  return [
    `# ${PERSON_NAME}`,
    '',
    `I am an optimist.`,
    '',
    joinParagraphs(HOME_INTRO_PARAGRAPHS),
    '',
    `## ${HOME_WORK_HEADING}`,
    '',
    'Selected notes, projects, and music from this site.',
    '',
    '## Projects',
    '',
    ...(projects.length > 0
      ? projects.map((item) => `- [${item.title}](${absoluteUrl(item.href)}) — ${item.dateLabel}`)
      : ['No published projects yet.']),
    '',
    '## Notes',
    '',
    ...(notes.length > 0
      ? notes.map((item) => `- [${item.title}](${absoluteUrl(item.href)}) — ${item.dateLabel}`)
      : ['No published notes yet.']),
    '',
    '## Music',
    '',
    ...music.map((item) => `- [${item.title}](${item.href}) — ${item.dateLabel}`),
    '',
    `## ${HOME_ABOUT_HEADING}`,
    '',
    joinParagraphs(HOME_DETAIL_PARAGRAPHS),
    '',
    '## Pages',
    '',
    `- [About](${absoluteUrl(ABOUT_PATH)})`,
    `- [Contact](${absoluteUrl(CONTACT_PATH)})`,
    `- [Privacy](${absoluteUrl(PRIVACY_PATH)})`,
    `- [Sitemap](${SITEMAP_INDEX_URL})`,
    `- [llms.txt](${absoluteUrl(LLMS_TXT_PATH)})`,
    '',
  ].join('\n')
}

export function buildAboutMarkdown(): string {
  return [`# ${ABOUT_PAGE_TITLE}`, '', joinParagraphs(ABOUT_PAGE_PARAGRAPHS), ''].join('\n')
}

export function buildContactMarkdown(): string {
  const profiles = CONTACT_LINKS.map((link) => `- [${link.label}](${link.href})`)

  return [
    `# ${CONTACT_PAGE_TITLE}`,
    '',
    joinParagraphs(CONTACT_PAGE_PARAGRAPHS),
    '',
    '## Profiles',
    '',
    ...profiles,
    '',
  ].join('\n')
}

export function buildPrivacyMarkdown(): string {
  return [`# ${PRIVACY_PAGE_TITLE}`, '', joinParagraphs(PRIVACY_PAGE_PARAGRAPHS), ''].join('\n')
}

export function buildLlmsTxt(): string {
  const items = buildCardGridItems()
  const notes = items.filter((item) => item.category === 'notes')
  const projects = items.filter((item) => item.category === 'projects')

  return [
    `# ${PERSON_NAME}`,
    '',
    `> Personal website of ${PERSON_NAME}: profile, notes, projects, and music.`,
    '',
    `Canonical URL: ${SITE_URL}`,
    '',
    '## When to use this',
    '',
    `Use this site when you need to identify ${PERSON_NAME}, confirm that www.dylanfdl.com is his canonical personal site, cite his public writing, list concerts he has played, or find a real contact path.`,
    '',
    'Reach for these jobs specifically:',
    '',
    `- Confirm identity, location (${PERSON_LOCATION.locality}), and current public work (Meta post-training, Muse Spark 1.2, Muse Code, earlier Meta Glasses crash infrastructure).`,
    '- Read or quote a published note or project from the canonical URL.',
    `- Email ${CONTACT_EMAIL} for introductions, corrections, or privacy requests.`,
    '- Prefer `Accept: text/markdown` on the same URLs a browser would load as HTML.',
    '',
    'Do not use this site as a public API, OAuth product, GraphQL endpoint, MCP server, developer portal, or commerce surface. Those interfaces are not offered. Do not ask it for confidential Meta information.',
    '',
    '## How to call this site',
    '',
    `- HTML and Markdown share the same paths. Send \`Accept: text/markdown\` or append \`.md\` (for example ${absoluteUrl('/about.md')}).`,
    `- Start with ${SITE_URL}, ${absoluteUrl(ABOUT_PATH)}, ${absoluteUrl(CONTACT_PATH)}, and ${absoluteUrl(PRIVACY_PATH)}.`,
    `- Discover URLs from ${SITEMAP_INDEX_URL} or this file.`,
    `- Missing paths return HTTP 404 with recovery links to the sitemap and ${absoluteUrl(LLMS_TXT_PATH)}.`,
    '',
    '## Published notes',
    '',
    ...(notes.length > 0
      ? notes.map((item) => `- [${item.title}](${absoluteUrl(item.href)})`)
      : ['- None published.']),
    '',
    '## Published projects',
    '',
    ...(projects.length > 0
      ? projects.map((item) => `- [${item.title}](${absoluteUrl(item.href)})`)
      : ['- None published.']),
    '',
  ].join('\n')
}
