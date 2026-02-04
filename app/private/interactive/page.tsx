import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/AuthButtons'
import { authOptions } from '@/lib/auth'
import TownScene from './TownScene'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Private Town',
}

export default async function TownPrivatePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerAction}>
          <SignOutButton />
        </div>
      </div>
      <TownScene />
    </div>
  )
}
