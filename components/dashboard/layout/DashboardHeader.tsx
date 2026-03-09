'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useSignOut } from '@/hooks/useSignOut'

export function DashboardHeader() {
  const { data: profile } = useCurrentUser()
  const signOut           = useSignOut()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between
                       border-b border-border bg-white/90 px-4 backdrop-blur-sm sm:px-6">

      {/* ── Logo / brand ─────────────────────────────────────── */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 focus-visible:outline-2
                   focus-visible:outline-jira-blue focus-visible:outline-offset-2 focus-visible:rounded-md"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-jira-blue shadow-sm">
          <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="white" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white" fillOpacity="0.35"
                  stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-text-primary hidden sm:block">
          IssueTracker
        </span>
      </Link>

      {/* ── Right: user pill + sign-out ───────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Avatar + name */}
        <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-jira-blue text-[10px] font-bold text-white">
            {initials}
          </div>
          <span className="hidden text-xs font-semibold text-text-primary sm:block max-w-[120px] truncate">
            {profile?.full_name ?? profile?.email ?? 'Loading…'}
          </span>
        </div>

        {/* Sign-out */}
        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          aria-label="Sign out"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted
                     transition-colors hover:bg-gray-100 hover:text-danger
                     focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-1
                     disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}