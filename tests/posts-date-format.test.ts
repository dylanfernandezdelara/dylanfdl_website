import { describe, expect, it } from 'vitest'
import { formatPostDate, formatPostDateShort } from '../lib/posts'

describe('formatPostDate', () => {
  it('formats YYYY-MM-DD into long english date', () => {
    expect(formatPostDate('2024-01-15', 'en-US')).toBe('January 15, 2024')
  })

  it('returns the original value for invalid input', () => {
    expect(formatPostDate('not-a-date')).toBe('not-a-date')
  })
})

describe('formatPostDateShort', () => {
  it('formats YYYY-MM-DD into short month/day', () => {
    expect(formatPostDateShort('2024-01-15', 'en-US')).toBe('Jan 15')
  })

  it('returns the original value for invalid input', () => {
    expect(formatPostDateShort('not-a-date')).toBe('not-a-date')
  })
})
