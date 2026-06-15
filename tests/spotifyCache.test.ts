import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SanitizedInfrastructureError } from '@/lib/sanitizedInfrastructureError'

const { mockGet, mockSet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    get = mockGet
    set = mockSet
  },
}))

process.env.KV_REST_API_URL = 'https://example.upstash.io'
process.env.KV_REST_API_TOKEN = 'test-token'

const {
  getCachedAccessToken,
  getNowPlayingCache,
  markLiveRefresh,
  setCachedAccessToken,
  setNowPlayingCache,
  shouldSkipLiveRefresh,
} = await import('@/lib/spotify/cache')

const SECRET_TOKEN = 'SECRET_TOKEN_VALUE'
const TOKEN_LEAK_ERROR = new Error(`limit exceeded, command was: {"token":"${SECRET_TOKEN}"}`)

async function expectSanitizedInfrastructureFailure(
  operation: () => Promise<unknown>,
  expectedMessage: string,
): Promise<void> {
  const error = await operation().catch((caught) => caught)
  expect(error).toBeInstanceOf(SanitizedInfrastructureError)
  expect((error as SanitizedInfrastructureError).logSuppressed).toBe(true)
  expect((error as Error).message).toBe(expectedMessage)
  expect((error as Error).message).not.toContain(SECRET_TOKEN)
}

describe('spotify cache redis error sanitization', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockSet.mockReset()
  })

  it('sanitizes getNowPlayingCache failures', async () => {
    mockGet.mockRejectedValueOnce(TOKEN_LEAK_ERROR)

    await expectSanitizedInfrastructureFailure(
      () => getNowPlayingCache(),
      'Failed to read now-playing cache',
    )
  })

  it('sanitizes getCachedAccessToken failures', async () => {
    mockGet.mockRejectedValueOnce(TOKEN_LEAK_ERROR)

    await expectSanitizedInfrastructureFailure(
      () => getCachedAccessToken(),
      'Failed to read Spotify access token cache',
    )
  })

  it('sanitizes shouldSkipLiveRefresh failures', async () => {
    mockGet.mockRejectedValueOnce(TOKEN_LEAK_ERROR)

    await expectSanitizedInfrastructureFailure(
      () => shouldSkipLiveRefresh(),
      'Failed to read live refresh debounce',
    )
  })

  it('sanitizes setCachedAccessToken failures', async () => {
    mockSet.mockRejectedValueOnce(TOKEN_LEAK_ERROR)

    await expectSanitizedInfrastructureFailure(
      () => setCachedAccessToken(SECRET_TOKEN, 3600),
      'Failed to cache Spotify access token',
    )
  })

  it('sanitizes setNowPlayingCache failures', async () => {
    mockSet.mockRejectedValueOnce(TOKEN_LEAK_ERROR)

    await expectSanitizedInfrastructureFailure(
      () =>
        setNowPlayingCache({
          track: {
            id: 'track-1',
            name: 'Instant Crush',
            artists: ['Daft Punk'],
            url: 'https://open.spotify.com/track/1',
          },
          updatedAt: new Date().toISOString(),
        }),
      'Failed to cache now-playing track',
    )
  })

  it('sanitizes markLiveRefresh failures', async () => {
    mockSet.mockRejectedValueOnce(TOKEN_LEAK_ERROR)

    await expectSanitizedInfrastructureFailure(
      () => markLiveRefresh(),
      'Failed to mark live refresh debounce',
    )
  })

  it('sanitizes getRedis initialization failures when env vars are missing', async () => {
    vi.resetModules()
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN

    const { getNowPlayingCache } = await import('@/lib/spotify/cache')
    const { SanitizedInfrastructureError: FreshSanitizedInfrastructureError } = await import(
      '@/lib/sanitizedInfrastructureError'
    )

    const error = await getNowPlayingCache().catch((caught) => caught)
    expect(error).toBeInstanceOf(FreshSanitizedInfrastructureError)
    expect((error as Error).message).toBe('Failed to initialize Redis client')
    expect((error as { logSuppressed?: boolean }).logSuppressed).toBe(true)

    process.env.KV_REST_API_URL = 'https://example.upstash.io'
    process.env.KV_REST_API_TOKEN = 'test-token'
    vi.resetModules()
  })
})
