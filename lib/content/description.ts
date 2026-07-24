import { DEFAULT_DESCRIPTION } from '@/lib/site'

/** SEO/OG/JSON-LD description: note summary when present, else site default. */
export function resolveContentDescription(summary?: string): string {
  return summary ?? DEFAULT_DESCRIPTION
}
