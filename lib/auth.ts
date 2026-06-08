// lib/auth.ts
// Full NextAuth v5 configuration — Node.js only (NOT imported in middleware).
// Spreads the edge-safe authConfig and layers on:
//   - PrismaAdapter (persists Users, Accounts to PostgreSQL)
//   - signIn / createUser events (auto-promote admin emails)

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/auth.config'

// Admin emails from environment — auto-promoted to ADMIN on first sign-in
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Spread the edge-safe config (providers, pages, callbacks, session strategy)
  ...authConfig,

  // Prisma adapter: persists User + Account records.
  // We keep session.strategy = 'jwt' (from authConfig) so the adapter only
  // manages Users/Accounts — not Sessions (no DB round-trip on every request).
  adapter: PrismaAdapter(prisma),

  callbacks: {
    // Inherit the jwt + session callbacks from authConfig
    ...authConfig.callbacks,

    // signIn: auto-promote known admin emails (best-effort, may run before user exists)
    async signIn({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        await prisma.user
          .update({
            where: { email: user.email },
            data: { role: 'ADMIN' },
          })
          .catch(() => {
            // User may not exist yet on first sign-in — handled in createUser event
          })
      }
      return true
    },
  },

  events: {
    // createUser fires AFTER the adapter inserts the new User row.
    // Reliable place to set the ADMIN role on first-ever sign-in.
    async createUser({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        })
      }
    },
  },
})
