import type { TextWidthMeasureElement } from '@/lib/nowPlayingTrackLayout'

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
      return resolveMockTextWidth(text, widthsByText)
    },
    getBoundingClientRect() {
      const width = resolveMockTextWidth(text, widthsByText)
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
