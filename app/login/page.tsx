import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SignInButton } from '@/components/AuthButtons'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Login',
}

const WRAPPER_STYLES = {
  position: 'fixed' as const,
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 1.5rem',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/private')
  }

  return (
    <div style={WRAPPER_STYLES}>
      <SignInButton callbackUrl="/private" />
    </div>
  )
}
