import { describe, expect, it } from 'vitest'
import { formatPostDate, formatPostDateCardGrid, formatPostDateShort } from '../lib/posts'

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

describe('formatPostDateCardGrid', () => {
  it('formats YYYY-MM-DD as M/YYYY', () => {
    expect(formatPostDateCardGrid('2025-12-20')).toBe('12/2025')
    expect(formatPostDateCardGrid('2024-01-15')).toBe('1/2024')
  })

  it('returns the original value for invalid input', () => {
    expect(formatPostDateCardGrid('not-a-date')).toBe('not-a-date')
  })
})
