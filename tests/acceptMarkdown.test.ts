import { describe, expect, it } from 'vitest'

import {
  appendVaryAccept,
  isDocumentNegotiation,
  preferredType,
  shouldNegotiate,
} from '@/lib/acceptMarkdown'

describe('preferredType', () => {
  it('defaults to HTML when Accept is missing', () => {
    expect(preferredType(null)).toBe('text/html')
  })

  it('prefers markdown when it appears first among equals', () => {
    expect(preferredType('text/markdown, text/html, */*')).toBe('text/markdown')
  })

  it('honors a higher HTML q-value', () => {
    expect(preferredType('text/markdown;q=0.4, text/html;q=0.8')).toBe('text/html')
  })

  it('returns null when every produced type is rejected', () => {
    expect(preferredType('application/pdf')).toBe(null)
    expect(preferredType('text/html;q=0, text/markdown;q=0, */*;q=0')).toBe(null)
  })

  it('lets a specific rejection beat a wildcard', () => {
    expect(preferredType('text/html;q=0, */*;q=1')).toBe('text/markdown')
  })
})

describe('shouldNegotiate', () => {
  it('skips Next Flight and Server Action requests', () => {
    expect(
      shouldNegotiate({
        method: 'GET',
        headers: new Headers({ accept: 'text/x-component', rsc: '1' }),
      }),
    ).toBe(false)
    expect(
      shouldNegotiate({
        method: 'POST',
        headers: new Headers({ accept: 'text/x-component', 'next-action': 'abc' }),
      }),
    ).toBe(false)
  })

  it('still negotiates ordinary document GET requests', () => {
    expect(
      shouldNegotiate({
        method: 'GET',
        headers: new Headers({ accept: 'text/markdown,text/html;q=0.8' }),
      }),
    ).toBe(true)
    expect(
      shouldNegotiate({
        method: 'GET',
        headers: new Headers({ accept: 'application/pdf' }),
      }),
    ).toBe(true)
  })
})

describe('isDocumentNegotiation', () => {
  it('treats HTML, Markdown, and PDF Accept values as document negotiation', () => {
    expect(isDocumentNegotiation('application/pdf')).toBe(true)
    expect(isDocumentNegotiation('text/markdown, text/html;q=0.8')).toBe(true)
    expect(isDocumentNegotiation('text/html;q=0, text/markdown;q=0')).toBe(true)
  })

  it('leaves Flight and other non-document Accept values alone', () => {
    expect(isDocumentNegotiation('text/x-component')).toBe(false)
    expect(isDocumentNegotiation('application/json')).toBe(false)
    expect(isDocumentNegotiation(null)).toBe(false)
  })
})

describe('appendVaryAccept', () => {
  it('adds Accept when Vary is empty', () => {
    const headers = new Headers()
    appendVaryAccept(headers)
    expect(headers.get('Vary')).toBe('Accept')
  })

  it('appends Accept without duplicating it', () => {
    const headers = new Headers({ Vary: 'rsc, next-router-state-tree' })
    appendVaryAccept(headers)
    appendVaryAccept(headers)
    expect(headers.get('Vary')).toBe('rsc, next-router-state-tree, Accept')
  })
})
