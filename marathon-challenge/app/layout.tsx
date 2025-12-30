import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marathon-a-Month Challenge',
  description: 'Track your monthly running miles and compete on the leaderboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
