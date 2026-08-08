import { describe, expect, it } from 'vitest'

import { CAREER_ENTRIES } from '@/lib/career'

describe('career', () => {
  it('lists roles newest first with company, dates, and favicon', () => {
    expect(CAREER_ENTRIES.map((entry) => entry.company)).toEqual([
      'Meta Applied AI',
      'Reality Labs',
      'Meta Billing',
      'Messenger',
    ])

    for (const entry of CAREER_ENTRIES) {
      expect(entry.role.length).toBeGreaterThan(0)
      expect(entry.dates.length).toBeGreaterThan(0)
      expect(entry.faviconSrc).toMatch(/^\/career\//)
    }
  })

  it('keeps the current role first', () => {
    expect(CAREER_ENTRIES[0]).toMatchObject({
      company: 'Meta Applied AI',
      role: 'Senior SWE',
      dates: 'May 2026 – Present',
    })
  })

  it('uses distinct favicons for Reality Labs and Messenger', () => {
    const byCompany = Object.fromEntries(
      CAREER_ENTRIES.map((entry) => [entry.company, entry.faviconSrc]),
    )

    expect(byCompany['Reality Labs']).toBe('/career/reality-labs.png')
    expect(byCompany.Messenger).toBe('/career/messenger.png')
    expect(byCompany['Meta Applied AI']).toBe('/career/meta.png')
    expect(byCompany['Meta Billing']).toBe('/career/meta.png')
  })
})
