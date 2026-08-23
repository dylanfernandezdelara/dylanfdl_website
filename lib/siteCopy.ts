import {
  ABOUT_PATH,
  CONTACT_EMAIL,
  CONTACT_PATH,
  LLMS_TXT_PATH,
  PERSON_LOCATION,
  PERSON_NAME,
  PERSON_ROLE,
  PRIVACY_PATH,
  SITE_URL,
} from '@/lib/site'

export const ABOUT_PAGE_TITLE = 'About'

export const CONTACT_PAGE_TITLE = 'Contact'

export const PRIVACY_PAGE_TITLE = 'Privacy'

export const HOME_WORK_HEADING = 'Work'

export const HOME_PROFILE_HEADING = 'Profile'

export const HOME_ABOUT_HEADING = 'About this site'

/** Plain-text twins of the homepage paragraphs that use ExternalLinks in HTML. */
export const HOME_LINKED_INTRO_PARAGRAPHS = [
  `I currently work on post-training at Meta and build RL environments for frontier coding agents. We recently launched Muse Spark 1.2 and Muse Code.`,
  `Previously, I scaled crash infrastructure for Meta Glasses.`,
  `I am a Yale graduate and am currently based in ${PERSON_LOCATION.locality}.`,
] as const

/** Extra homepage paragraphs for Markdown only. Keep HTML visually unchanged. */
export const HOME_SHARED_INTRO_PARAGRAPHS = [
  `This website is the public record I keep of work I can share. Notes are the best place to see how I think. Projects appear when I have something people can read or use. Music is a list of concerts I played, with recordings where they exist.`,
  `If you are confirming who I am, this is the canonical site for ${PERSON_NAME} (${new URL(SITE_URL).hostname}). Use Contact to email me. About and Privacy have a longer biography and how this site handles data. I do not run a public API, developer portal, or MCP server here.`,
] as const

export const HOME_INTRO_PARAGRAPHS = [
  ...HOME_LINKED_INTRO_PARAGRAPHS,
  ...HOME_SHARED_INTRO_PARAGRAPHS,
] as const

export const HOME_WORK_INTRO = 'Selected notes, projects, and music from this site.'

export const ABOUT_PAGE_PARAGRAPHS = [
  `${PERSON_NAME} is a ${PERSON_ROLE.toLowerCase()} based in ${PERSON_LOCATION.locality}, ${PERSON_LOCATION.region}. I currently work on post-training at Meta and build reinforcement-learning environments for frontier coding agents. That work recently included Muse Spark 1.2 and Muse Code.`,
  `Before that I scaled crash infrastructure for Meta Glasses. I studied at Yale. This site is my public notebook: a short profile on the home page, notes when I want to make an idea precise, projects when there is something to inspect, and a record of concerts I played.`,
  `I write in public to clarify my own thinking, not to run a product or a developer platform. If you need a professional contact path, a longer biography, or a privacy statement, those pages live on this same domain. The home page remains the profile; About exists so agents and people can find a stable, text-first biography without depending on the card grid.`,
  `You can reach me by email or through the profiles listed on Contact. I am the only person who publishes here. Nothing on this site is a Meta documentation portal, and I do not publish private work information.`,
] as const

/** About plus agent-facing extras for Markdown only. Keep HTML visually unchanged. */
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

export function joinParagraphs(paragraphs: readonly string[]): string {
  return paragraphs.join('\n\n')
}
