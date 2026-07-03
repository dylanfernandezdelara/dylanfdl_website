import { buildSlotText } from 'slot-text'

export function seedEmptyBaseline(container: HTMLElement, length: number): string {
  const baseline = '\u00A0'.repeat(length)
  buildSlotText(container, baseline)
  return baseline
}
