// auth.config.ts
// Edge-safe NextAuth configuration — NO Prisma, NO Node.js-only APIs.
// Used by:
//   - middleware.ts (runs in Next.js Edge Runtime)
//
// The full config (with PrismaAdapter + events) lives in lib/auth.ts
// and is only used in Node.js contexts (API routes, Server Components).

import type { UserRole } from '@prisma/client'

import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

// Routes that require an authenticated session.
// NOTE: /submit is intentionally NOT protected — submissions are anonymous by design.
// Users may optionally sign in to link a submission to their account, but it is not required.
const PROTECTED_PATHS = ['/admin', '/api/v1/admin']

export const authConfig: NextAuthConfig = {
  providers: [
    // Providers must be listed here too so the middleware can validate tokens
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    // `authorized` runs in the Edge Runtime — no DB access allowed here
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user
      const isProtected = PROTECTED_PATHS.some((p) =>
        nextUrl.pathname.startsWith(p)
      )
      if (isProtected && !isLoggedIn) {
        // Redirect to sign-in with return path
        const signInUrl = new URL('/auth/signin', nextUrl)
        signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return Response.redirect(signInUrl)
      }
      return true
    },

    // JWT callback — runs in both Edge and Node; shapes what's in the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // role is set by the signIn/createUser events in lib/auth.ts
        token.role = (user as { role?: string }).role ?? 'USER'
      }
      return token
    },

    // session callback — attaches id + role to the client-visible session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = ((token.role as string) ?? 'USER') as UserRole
      }
      return session
    },
  },

  // JWT strategy: the session is a signed cookie, not a DB row.
  // This means the middleware can verify auth without a DB round-trip.
  // The PrismaAdapter in lib/auth.ts still persists Users + Accounts to Postgres.
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  trustHost: true,
}
