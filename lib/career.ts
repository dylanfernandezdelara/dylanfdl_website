export type CareerEntry = {
  company: string
  role: string
  dates: string
  /** Local path under /public for the company favicon. */
  faviconSrc: string
  faviconAlt: string
  href?: string
}

export const CAREER_ENTRIES = [
  {
    company: 'Meta Applied AI',
    role: 'Senior SWE',
    dates: 'May 2026 – Present',
    faviconSrc: '/career/meta.png',
    faviconAlt: 'Meta',
    href: 'https://ai.meta.com',
  },
  {
    company: 'Reality Labs',
    role: 'SWE',
    dates: 'Nov 2024 – May 2026',
    faviconSrc: '/career/meta.png',
    faviconAlt: 'Meta',
    href: 'https://www.meta.com/ai-glasses/',
  },
  {
    company: 'Meta Billing',
    role: 'SWE',
    dates: 'Nov 2023 – Nov 2024',
    faviconSrc: '/career/meta.png',
    faviconAlt: 'Meta',
    href: 'https://www.meta.com',
  },
  {
    company: 'Messenger',
    role: 'SWE Intern',
    dates: 'Summer 2022',
    faviconSrc: '/career/meta.png',
    faviconAlt: 'Meta',
    href: 'https://www.messenger.com',
  },
] as const satisfies readonly CareerEntry[]
