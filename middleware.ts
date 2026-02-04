import { withAuth } from 'next-auth/middleware'

const allowedEmails = (process.env.ALLOWED_GOOGLE_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const isEmailAllowed = (email?: string | null) => {
  if (!email || allowedEmails.length === 0) {
    return false
  }
  return allowedEmails.includes(email.trim().toLowerCase())
}

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      const email = typeof token?.email === 'string' ? token.email : undefined
      return isEmailAllowed(email)
    },
  },
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/private/:path*'],
}
