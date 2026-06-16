import type {
  PrefixRowMeasureElement,
  TextWidthMeasureElement,
} from '@/lib/nowPlaying/trackLayout'
import { formatLabelTitleLine } from '@/lib/nowPlaying/trackLayout'

function resolveMockTextWidth(
  text: string,
  widthsByText: Record<string, number>,
  fallbackWidth?: number,
): number {
  const width = widthsByText[text] ?? fallbackWidth
  if (width === undefined) {
    throw new Error(`Missing mocked width for text: ${text}`)
  }

  return width
}

export function createMockTextMeasure(
  widthsByText: Record<string, number>,
  options?: { fallbackWidth?: number },
): TextWidthMeasureElement {
  let text = ''

  return {
    get textContent() {
      return text
    },
    set textContent(value) {
      text = value ?? ''
    },
    get scrollWidth() {
      return resolveMockTextWidth(text, widthsByText, options?.fallbackWidth)
    },
    getBoundingClientRect() {
      const width = resolveMockTextWidth(text, widthsByText, options?.fallbackWidth)
      return { width } as DOMRect
    },
  }
}

export function attachMockTextMeasure(
  node: HTMLSpanElement,
  widthsByText: Record<string, number>,
  options?: { fallbackWidth?: number },
): void {
  node.getBoundingClientRect = function getBoundingClientRect(this: HTMLSpanElement) {
    const text = this.textContent ?? ''
    const width = resolveMockTextWidth(text, widthsByText, options?.fallbackWidth)

    return {
      width,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 0,
      toJSON: () => ({}),
    } as DOMRect
  }

  Object.defineProperty(node, 'scrollWidth', {
    configurable: true,
    get(this: HTMLSpanElement) {
      const text = this.textContent ?? ''
      return resolveMockTextWidth(text, widthsByText, options?.fallbackWidth)
    },
  })
}

export function createMockPrefixRowMeasure(
  widthsByLabelTitle: Record<string, number>,
): PrefixRowMeasureElement {
  let label = ''
  let title = ''

  const labelMeasure: TextWidthMeasureElement = {
    get textContent() {
      return label
    },
    set textContent(value) {
      label = value ?? ''
    },
    get scrollWidth() {
      return 0
    },
    getBoundingClientRect() {
      return { width: 0 } as DOMRect
    },
  }

  const titleMeasure: TextWidthMeasureElement = {
    get textContent() {
      return title
    },
    set textContent(value) {
      title = value ?? ''
    },
    get scrollWidth() {
      return 0
    },
    getBoundingClientRect() {
      return { width: 0 } as DOMRect
    },
  }

  return {
    labelSpan: labelMeasure,
    titleSpan: titleMeasure,
    root: {
      get scrollWidth() {
        return widthsByLabelTitle[formatLabelTitleLine(label, title)] ?? 0
      },
      getBoundingClientRect() {
        const width = widthsByLabelTitle[formatLabelTitleLine(label, title)] ?? 0
        return { width } as DOMRect
      },
    },
  }
}

export function attachMockPrefixRowMeasure(
  root: HTMLSpanElement,
  widthsByLabelTitle: Record<string, number>,
): void {
  const labelSpan = root.querySelector<HTMLSpanElement>(
    '.now-playing-measure-label, .now-playing-label',
  )
  const titleSpan = root.querySelector<HTMLSpanElement>('.now-playing-slot')
  if (!labelSpan || !titleSpan) {
    throw new Error('prefix row measure requires label and slot spans')
  }

  root.getBoundingClientRect = function getBoundingClientRect(this: HTMLSpanElement) {
    const label = labelSpan.textContent ?? ''
    const title = titleSpan.textContent ?? ''
    const width = widthsByLabelTitle[formatLabelTitleLine(label, title)] ?? 0

    return {
      width,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 0,
      toJSON: () => ({}),
    } as DOMRect
  }

  Object.defineProperty(root, 'scrollWidth', {
    configurable: true,
    get(this: HTMLSpanElement) {
      const label = labelSpan.textContent ?? ''
      const title = titleSpan.textContent ?? ''
      return widthsByLabelTitle[formatLabelTitleLine(label, title)] ?? 0
    },
  })
}
