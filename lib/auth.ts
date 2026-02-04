import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { isEmailAllowed, normalizeEmail } from '@/lib/auth-allowlist'

const requireEnv = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }
  return value
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return isEmailAllowed(profile?.email)
    },
    async jwt({ token, profile }) {
      const email = normalizeEmail(profile?.email)
      if (email) {
        token.email = email
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
}
