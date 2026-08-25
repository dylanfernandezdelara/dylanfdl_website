export const VIEWPORTS = [390, 481, 640, 768, 1080] as const

export const THEMES = ['light', 'dark'] as const

export type VisualViewport = (typeof VIEWPORTS)[number]
export type VisualTheme = (typeof THEMES)[number]
export type VisualState = 'default' | 'search' | 'projects'

export type VisualCase = {
  id: string
  route: string
  state: VisualState
}

export const VISUAL_CASES: VisualCase[] = [
  { id: 'home', route: '/', state: 'default' },
  { id: 'home-search', route: '/', state: 'search' },
  { id: 'home-projects', route: '/', state: 'projects' },
  { id: 'about', route: '/about', state: 'default' },
  { id: 'contact', route: '/contact', state: 'default' },
  { id: 'privacy', route: '/privacy', state: 'default' },
  { id: 'not-found', route: '/this-page-does-not-exist', state: 'default' },
  { id: 'note-showcase', route: '/notes/component-showcase', state: 'default' },
]

export function screenshotName(
  caseId: string,
  viewport: VisualViewport,
  theme: VisualTheme,
): string {
  return `${caseId}__${viewport}__${theme}.png`
}
