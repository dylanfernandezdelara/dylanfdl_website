import { describe, expect, it } from 'vitest'
import { formatPostDate, formatPostDateCardGrid } from '../lib/posts'

describe('formatPostDate', () => {
  it('formats YYYY-MM-DD into long english date', () => {
    expect(formatPostDate('2024-01-15', 'en-US')).toBe('January 15, 2024')
  })

  it('returns the original value for invalid input', () => {
    expect(formatPostDate('not-a-date')).toBe('not-a-date')
  })

  it('rejects inputs with empty segments rather than silently coercing to 0', () => {
    // Previously '2024-1-' parsed to new Date(2024, 0, 0) = Dec 31, 2023.
    expect(formatPostDate('2024-1-')).toBe('2024-1-')
    expect(formatPostDate('-1-15')).toBe('-1-15')
    expect(formatPostDate('2024--15')).toBe('2024--15')
  })

  it('rejects days that do not exist in the given month', () => {
    expect(formatPostDate('2024-02-31')).toBe('2024-02-31')
  })
})

describe('formatPostDateCardGrid', () => {
  it('formats YYYY-MM-DD as short month and year', () => {
    expect(formatPostDateCardGrid('2025-12-20')).toBe('Dec 2025')
    expect(formatPostDateCardGrid('2024-01-15')).toBe('Jan 2024')
  })

  it('formats YYYY-MM and YYYY using the first day of the month or year', () => {
    expect(formatPostDateCardGrid('2024-06')).toBe('Jun 2024')
    expect(formatPostDateCardGrid('2024')).toBe('Jan 2024')
  })

  it('returns the original value for invalid input', () => {
    expect(formatPostDateCardGrid('not-a-date')).toBe('not-a-date')
  })

  it('rejects days that do not exist in the given month', () => {
    // Feb 31 silently rolled to March 2 previously.
    expect(formatPostDateCardGrid('2024-02-31')).toBe('2024-02-31')
    expect(formatPostDateCardGrid('2024-04-31')).toBe('2024-04-31')
    expect(formatPostDateCardGrid('2023-02-29')).toBe('2023-02-29')
    // Leap day is still valid.
    expect(formatPostDateCardGrid('2024-02-29')).toBe('Feb 2024')
  })

  it('rejects inputs with empty segments', () => {
    expect(formatPostDateCardGrid('2024-1-')).toBe('2024-1-')
    expect(formatPostDateCardGrid('2024--')).toBe('2024--')
  })
})
