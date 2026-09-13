/** Assumed root font-size used only to name the rhythm in px (html is 16px). */
export const LAYOUT_GRID_ROOT_PX = 16

/** Minor rhythm: 8px at the 16px root. Keep in sync with `--space-minor`. */
export const LAYOUT_GRID_MINOR_REM = 0.5

/** Major rhythm: 24px at the 16px root (3 × minor). Keep in sync with `--space-major`. */
export const LAYOUT_GRID_MAJOR_REM = 1.5

export const LAYOUT_GRID_MINOR_PX = LAYOUT_GRID_MINOR_REM * LAYOUT_GRID_ROOT_PX
export const LAYOUT_GRID_MAJOR_PX = LAYOUT_GRID_MAJOR_REM * LAYOUT_GRID_ROOT_PX

/** Hairline used for every overlay stroke — minor and major share this width. */
export const LAYOUT_GRID_LINE_WIDTH_PX = 1

export const LAYOUT_GRID_QUERY_PARAM = 'grid'
export const LAYOUT_GRID_STORAGE_KEY = 'layout-grid'
export const LAYOUT_GRID_HOTKEY = 'g'

/** Local/testing only. Production builds never mount the overlay. */
export function isLayoutGridAvailable(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv !== 'production'
}

export function parseLayoutGridQuery(search: string): boolean | null {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  const value = params.get(LAYOUT_GRID_QUERY_PARAM)
  if (value === null) return null
  if (value === '0' || value === 'false' || value === 'off') return false
  return true
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

export function isLayoutGridHotkey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return false
  if (event.altKey || event.ctrlKey || event.metaKey) return false
  if (event.key.toLowerCase() !== LAYOUT_GRID_HOTKEY) return false
  return !isTypingTarget(event.target)
}

export function readLayoutGridSession(storage: Pick<Storage, 'getItem'>): boolean {
  return storage.getItem(LAYOUT_GRID_STORAGE_KEY) === 'on'
}

export function writeLayoutGridSession(
  storage: Pick<Storage, 'setItem'>,
  enabled: boolean,
): void {
  storage.setItem(LAYOUT_GRID_STORAGE_KEY, enabled ? 'on' : 'off')
}
