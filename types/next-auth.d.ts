// types/next-auth.d.ts
// Extend NextAuth session + JWT types to include user id and role.
// This allows session.user.id, session.user.role, token.id, token.role
// to be typed correctly throughout the application.

import type { DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
  }
}
