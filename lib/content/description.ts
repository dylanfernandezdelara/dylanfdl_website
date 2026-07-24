import { DEFAULT_DESCRIPTION } from '@/lib/site'

export function resolveContentDescription(summary?: string): string {
  return summary ?? DEFAULT_DESCRIPTION
}
