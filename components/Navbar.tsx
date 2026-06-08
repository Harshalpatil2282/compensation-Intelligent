// components/Navbar.tsx
// Shared top navigation bar — Server Component.
// Reads session server-side so there's no auth flicker.
// Shows:
//   - Logo + nav links
//   - User avatar + dropdown when signed in (via UserMenu client component)
//   - "Sign In" link when signed out

import { auth } from '@/lib/auth'
import { UserMenu } from '@/components/UserMenu'
import Link from 'next/link'

interface NavbarProps {
  activePath?: '/explore' | '/compare' | '/submit' | '/'
}

export async function Navbar({ activePath }: NavbarProps) {
  const session = await auth()
  const user = session?.user

  const linkClass = (path: string) =>
    activePath === path
      ? 'text-white border-b-2 border-indigo-500 pb-0.5 text-sm'
      : 'text-slate-400 hover:text-white transition-colors text-sm'

  return (
    <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CI</span>
            </div>
            <span className="font-bold text-white">CompIntel</span>
          </Link>
          <nav className="hidden sm:flex gap-5">
            <Link href="/explore" className={linkClass('/explore')}>Explore</Link>
            <Link href="/compare" className={linkClass('/compare')}>Compare</Link>
            <Link href="/submit" className={linkClass('/submit')}>Submit</Link>
          </nav>
        </div>

        {/* Right: Auth */}
        {user ? (
          <UserMenu
            name={user.name}
            email={user.email}
            image={user.image}
          />
        ) : (
          <Link
            href="/auth/signin"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
