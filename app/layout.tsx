// app/layout.tsx
// Root layout: font setup, TanStack Query provider, NextAuth session provider
// All pages inherit this layout

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CompIntel — Compensation Intelligence Platform',
    template: '%s | CompIntel',
  },
  description:
    'Transparent, level-normalized compensation data for tech professionals in India and globally. Compare offers, understand your market value, submit anonymously.',
  keywords: [
    'compensation',
    'salary',
    'levels',
    'tech salary India',
    'software engineer salary',
    'level normalization',
    'total compensation',
  ],
  openGraph: {
    title: 'CompIntel — Compensation Intelligence Platform',
    description: 'Level-normalized compensation data for tech professionals',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
