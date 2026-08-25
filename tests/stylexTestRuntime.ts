type StyleObject = Record<string, unknown>

export function create<T extends Record<string, StyleObject>>(styles: T): T {
  return styles
}

export function props(...styleObjs: Array<StyleObject | null | undefined | false>): {
  className: string
} {
  const className = styleObjs
    .filter((value): value is StyleObject => Boolean(value))
    .map((_, index) => `sx-test-${index}`)
    .join(' ')
  return { className }
}

export function keyframes(frames: Record<string, StyleObject>): string {
  void frames
  return 'sx-test-kf'
}

const stylex = { create, props, keyframes }

export default stylex
