import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? ''

const getAllowedEmails = () =>
  (process.env.ALLOWED_GOOGLE_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

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
      const allowedEmails = getAllowedEmails()
      const email = normalizeEmail(profile?.email)
      if (!email || allowedEmails.length === 0) {
        return false
      }
      return allowedEmails.includes(email)
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
