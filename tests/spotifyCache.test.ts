import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSet } = vi.hoisted(() => ({
  mockSet: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    set = mockSet
  },
}))

process.env.KV_REST_API_URL = 'https://example.upstash.io'
process.env.KV_REST_API_TOKEN = 'test-token'

const { setCachedAccessToken } = await import('@/lib/spotify/cache')

describe('setCachedAccessToken', () => {
  beforeEach(() => {
    mockSet.mockReset()
  })

  it('rethrows a sanitized error when redis.set fails', async () => {
    mockSet.mockRejectedValueOnce(
      new Error('limit exceeded, command was: {"token":"SECRET_TOKEN_VALUE"}'),
    )

    let caught: Error | undefined
    try {
      await setCachedAccessToken('SECRET_TOKEN_VALUE', 3600)
    } catch (error) {
      caught = error as Error
    }

    expect(caught).toBeInstanceOf(Error)
    expect(caught!.message).toBe('Failed to cache Spotify access token')
    expect(caught!.message).not.toContain('SECRET_TOKEN_VALUE')
  })
})
