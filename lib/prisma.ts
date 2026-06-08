// lib/prisma.ts
// Prisma Client singleton — prevents multiple instances in Next.js dev hot-reload
// Uses connection pooling configuration optimized for Neon serverless PostgreSQL

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    // Neon serverless: keep connection count low
    // The DATABASE_URL already includes connection_limit=1 for pgBouncer
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
