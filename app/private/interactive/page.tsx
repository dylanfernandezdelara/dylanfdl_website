import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import TownScene from './TownScene'

export const metadata: Metadata = {
  title: 'Private Town',
}

export default async function TownPrivatePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      <TownScene />
    </div>
  )
}
