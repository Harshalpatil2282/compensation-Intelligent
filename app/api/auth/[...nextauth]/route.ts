// app/api/auth/[...nextauth]/route.ts
// NextAuth v5 route handler

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
