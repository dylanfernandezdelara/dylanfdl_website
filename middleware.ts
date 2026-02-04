import { withAuth } from 'next-auth/middleware'
import { getAllowedEmails, isEmailAllowed } from '@/lib/auth-allowlist'

const allowedEmails = getAllowedEmails()

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      const email = typeof token?.email === 'string' ? token.email : undefined
      return isEmailAllowed(email, allowedEmails)
    },
  },
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/private/:path*'],
}
