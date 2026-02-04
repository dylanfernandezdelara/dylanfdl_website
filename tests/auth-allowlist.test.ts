import { afterEach, describe, expect, it } from 'vitest'
import {
  getAllowedEmails,
  isEmailAllowed,
  normalizeEmail,
  parseAllowedEmails,
} from '../lib/auth-allowlist'

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  USER@Example.com ')).toBe('user@example.com')
  })

  it('handles nullish values', () => {
    expect(normalizeEmail(undefined)).toBe('')
    expect(normalizeEmail(null)).toBe('')
  })
})

describe('parseAllowedEmails', () => {
  it('parses comma-separated list', () => {
    expect(parseAllowedEmails('a@b.com, B@c.com , ,')).toEqual(['a@b.com', 'b@c.com'])
  })

  it('returns empty array for empty input', () => {
    expect(parseAllowedEmails('')).toEqual([])
    expect(parseAllowedEmails(undefined)).toEqual([])
  })
})

describe('getAllowedEmails', () => {
  const original = process.env.ALLOWED_GOOGLE_EMAILS

  afterEach(() => {
    if (typeof original === 'string') {
      process.env.ALLOWED_GOOGLE_EMAILS = original
    } else {
      delete process.env.ALLOWED_GOOGLE_EMAILS
    }
  })

  it('reads from environment and normalizes', () => {
    process.env.ALLOWED_GOOGLE_EMAILS = 'one@example.com, TWO@EXAMPLE.COM'
    expect(getAllowedEmails()).toEqual(['one@example.com', 'two@example.com'])
  })
})

describe('isEmailAllowed', () => {
  it('returns false when no allowlist is set', () => {
    expect(isEmailAllowed('user@example.com', [])).toBe(false)
  })

  it('matches case-insensitively', () => {
    const allowed = parseAllowedEmails('user@example.com, other@example.com')
    expect(isEmailAllowed('USER@EXAMPLE.COM', allowed)).toBe(true)
  })

  it('rejects missing email', () => {
    const allowed = parseAllowedEmails('user@example.com')
    expect(isEmailAllowed(undefined, allowed)).toBe(false)
  })
})
