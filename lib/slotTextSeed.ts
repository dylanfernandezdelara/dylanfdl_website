import { buildSlotText } from 'slot-text'

/** slot-text instant-builds when no `.char-slot` nodes exist; seed placeholders so the first roll animates. */
export function seedEmptyBaseline(container: HTMLElement, length: number): string {
  const baseline = '\u00A0'.repeat(length)
  buildSlotText(container, baseline)
  return baseline
}
