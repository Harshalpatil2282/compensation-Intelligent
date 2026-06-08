// middleware.ts
// Next.js Edge Middleware — runs on EVERY request before the page renders.
// Responsibilities:
//   1. Route protection (redirects unauthenticated users from protected pages)
//   2. In-memory rate limiting (per-IP, 60 req/min)
//
// IMPORTANT: This file runs in the Edge Runtime.
// Do NOT import anything that uses Node.js APIs (fs, net, crypto, etc.)
// Do NOT import lib/auth.ts (it uses PrismaClient which is Node.js-only).
// Instead we use the edge-safe NextAuth config from auth.config.ts.

import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Build a minimal edge-safe NextAuth instance (no Prisma, JWT-only)
const { auth } = NextAuth(authConfig)

// ---------------------------------------------------------------------------
// SIMPLE RATE LIMITER (in-memory, resets on server restart)
// Production: replace with Upstash Redis using @upstash/ratelimit
// ---------------------------------------------------------------------------

const requestCounts = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60   // 60 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX_REQUESTS
}

// ---------------------------------------------------------------------------
// MIDDLEWARE HANDLER
// The `auth` wrapper calls authConfig.callbacks.authorized() automatically.
// We add rate limiting on top.
// ---------------------------------------------------------------------------

export default auth(async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Extract IP for rate limiting (Vercel sets x-forwarded-for)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'

  // Rate limit API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({
          data: null,
          error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
          meta: null,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  // Match all routes except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
