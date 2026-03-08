import { type ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────
//  Auth Group Layout
//  Full-screen, vertically + horizontally centered.
//  Jira-blue gradient background behind the white auth card.
//  Middleware already guards this group (redirects authenticated
//  users to /dashboard before this layout even renders).
// ─────────────────────────────────────────────────────────────

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      {children}
    </main>
  )
}
