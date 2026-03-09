'use client'

import Link from 'next/link'
import { LayoutDashboard, KanbanSquare, Users, ChevronLeft } from 'lucide-react'
import { NavItem } from './NavItem'
import type { Organization } from '@/types/database'


interface SidebarProps {
  org: Organization
}

export function Sidebar({ org }: SidebarProps) {
  const base = `/dashboard/${org.slug}`

  return (
    <aside
      className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface"
      aria-label="Workspace navigation"
    >
      {/* ── Org header ──────────────────────────────────────── */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        {/* Org avatar */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center
                        rounded-md bg-jira-blue text-[11px] font-bold text-white">
          {org.name.slice(0, 2).toUpperCase()}
        </div>
        <span className="truncate text-sm font-semibold text-text-primary">
          {org.name}
        </span>
      </div>

      {/* ── Nav links ───────────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" role="navigation">
        <NavItem
          href={base}
          label="Board"
          icon={KanbanSquare}
          exact
        />
        <NavItem
          href={`${base}/members`}
          label="Members"
          icon={Users}
        />
      </nav>

      {/* ── Footer: back to orgs ────────────────────────────── */}
      <div className="shrink-0 border-t border-border p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs
                     font-medium text-text-muted transition-colors
                     hover:bg-gray-100 hover:text-text-secondary"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          All workspaces
        </Link>
      </div>
    </aside>
  )
}
