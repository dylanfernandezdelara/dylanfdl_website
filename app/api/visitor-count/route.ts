import { BlobNotFoundError, head, put, type HeadBlobResult } from '@vercel/blob'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SESSION_COOKIE_NAME = 'visitor_session'
const SESSION_DURATION_MINS = 30

const COUNT_CACHE_TTL_MS = 15_000
let cachedCount: { value: number; cachedAt: number } | null = null

function setCachedCount(value: number) {
  cachedCount = { value, cachedAt: Date.now() }
}

async function getCountCached(): Promise<number> {
  if (cachedCount && Date.now() - cachedCount.cachedAt < COUNT_CACHE_TTL_MS) {
    return cachedCount.value
  }
  const value = await getCount()
  setCachedCount(value)
  return value
}

function getCounterBucket(): 'dev' | 'preview' | 'prod' {
  // Preserve existing blob naming (dev/prod) while optionally separating preview.
  if (process.env.NODE_ENV === 'development') return 'dev'
  if (process.env.VERCEL_ENV === 'preview') return 'preview'
  return 'prod'
}

function hasBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function getBlobCounterPathname(): string {
  return `visitor-counter-${getCounterBucket()}.json`
}

async function readCountFromBlob(blob: HeadBlobResult): Promise<number> {
  // `downloadUrl` tends to be the most reliable for fetching raw contents.
  const urls = [blob.downloadUrl, blob.url].filter(Boolean)

  let lastError: unknown
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Failed to fetch blob contents (${response.status} ${response.statusText})`)
      }

      const raw = await response.text()
      const data = JSON.parse(raw) as { count?: unknown }
      const count = Number(data?.count)
      return Number.isFinite(count) && count >= 0 ? count : 0
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('Failed to read blob contents')
}

async function getCount(): Promise<number> {
  if (!hasBlobConfigured()) {
    throw new Error('Blob storage not configured (missing BLOB_READ_WRITE_TOKEN)')
  }

  const pathname = getBlobCounterPathname()
  try {
    const blob = await head(pathname)
    return await readCountFromBlob(blob)
  } catch (error) {
    if (error instanceof BlobNotFoundError) return 0
    throw error
  }
}

async function incrementCount(): Promise<number> {
  if (!hasBlobConfigured()) {
    throw new Error('Blob storage not configured (missing BLOB_READ_WRITE_TOKEN)')
  }

  const currentCount = await getCount()
  const newCount = currentCount + 1
  const pathname = getBlobCounterPathname()

  await put(pathname, JSON.stringify({ count: newCount }), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60, // seconds (minimum is 60)
  })

  setCachedCount(newCount)

  return newCount
}

export async function GET() {
  try {
    if (!hasBlobConfigured()) {
      return NextResponse.json(
        { error: 'Storage not configured', count: 0, isNewSession: false },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      // New session (30-minute de-dupe) -> increment the lifetime counter.
      const count = await incrementCount()

      const response = NextResponse.json(
        { count, isNewSession: true },
        { headers: { 'Cache-Control': 'no-store' } }
      )

      response.cookies.set(SESSION_COOKIE_NAME, Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION_MINS * 60,
        path: '/',
      })

      return response
    }

    // Existing session -> just read the current lifetime count.
    const count = await getCountCached()
    return NextResponse.json(
      { count, isNewSession: false },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Visitor count API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', count: 0, isNewSession: false },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
