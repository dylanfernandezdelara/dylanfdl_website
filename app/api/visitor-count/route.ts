import { put, head } from '@vercel/blob'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'visitor_session'
const SESSION_DURATION_MINS = 30

function getCounterFileName(): string {
  // Use dev counter for local development, prod counter for production/preview
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? 'visitor-counter-dev.json' : 'visitor-counter-prod.json'
}

async function getCount(): Promise<number> {
  const fileName = getCounterFileName()
  
  try {
    const blob = await head(fileName)
    if (blob) {
      const response = await fetch(blob.url)
      const data = await response.json()
      return data.count || 0
    }
  } catch (error) {
    // Blob doesn't exist yet, or other error - start at 0
    console.log('getCount error (expected if blob does not exist yet):', error)
  }
  
  return 0
}

async function incrementCount(): Promise<number> {
  const currentCount = await getCount()
  const newCount = currentCount + 1
  const fileName = getCounterFileName()
  
  console.log(`Incrementing counter: ${currentCount} -> ${newCount}, file: ${fileName}`)
  
  try {
    const blob = await put(fileName, JSON.stringify({ count: newCount }), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    console.log('Blob created/updated:', blob.url)
  } catch (error) {
    console.error('Failed to write blob:', error)
    throw error
  }
  
  return newCount
}

export async function GET() {
  try {
    // Check if Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set')
      return NextResponse.json(
        { error: 'Blob storage not configured', count: 0, isNewSession: false },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    let count: number
    let isNewSession = false
    
    if (!sessionCookie) {
      // New session - increment the counter
      count = await incrementCount()
      isNewSession = true
      
      // Set session cookie
      const response = NextResponse.json({ count, isNewSession })
      response.cookies.set(SESSION_COOKIE_NAME, Date.now().toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION_MINS * 60, // 30 minutes in seconds
        path: '/',
      })
      
      return response
    }
    
    // Existing session - just return the count
    count = await getCount()
    
    return NextResponse.json({ count, isNewSession })
  } catch (error) {
    console.error('Visitor count API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', count: 0, isNewSession: false },
      { status: 500 }
    )
  }
}

