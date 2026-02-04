import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/AuthButtons'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Private',
}

const CONTENT_STYLES = {
  fontSize: '1rem',
  lineHeight: '1.6',
}

const META_STYLES = {
  color: 'var(--fg2)',
  marginTop: '0.75rem',
}

const BUTTON_ROW_STYLES = {
  marginTop: '1.5rem',
}

export default async function PrivatePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="content-wrapper">
      <div style={CONTENT_STYLES}>
        <h1>Private area</h1>
        <p style={META_STYLES}>Signed in as {session.user?.email ?? 'unknown'}</p>
        <p style={META_STYLES}>
          This content is only served after a successful Google sign-in.
        </p>
        <div style={BUTTON_ROW_STYLES}>
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
