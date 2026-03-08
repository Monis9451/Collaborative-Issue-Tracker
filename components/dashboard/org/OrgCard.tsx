import Link from 'next/link'
import { Settings, Users } from 'lucide-react'
import type { AppRole, Organization } from '@/types/database'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
//  OrgCard — clickable card representing a single organization.
//
//  Admin card:  shows a settings icon + "Admin" badge.
//  Member card: simpler, no admin controls visible.
//
//  Clicking anywhere navigates to /dashboard/org/[slug].
// ─────────────────────────────────────────────────────────────

interface OrgCardProps {
  organization: Organization
  role:         AppRole
}

const ROLE_COLORS: Record<AppRole, string> = {
  admin:  'bg-jira-blue-light text-jira-blue-dark',
  member: 'bg-gray-100 text-text-secondary',
}

/** Deterministic color from org name initial — decorative. */
function orgColor(name: string) {
  const hues = [221, 262, 197, 24, 142, 330, 48]
  const idx  = name.charCodeAt(0) % hues.length
  return `hsl(${hues[idx]}, 65%, 50%)`
}

export function OrgCard({ organization, role }: OrgCardProps) {
  const isAdmin = role === 'admin'
  const initial = (organization.name[0] ?? '?').toUpperCase()
  const color   = orgColor(organization.name)

  return (
    <Link
      href={`/dashboard/${organization.slug}`}
      className={cn(
        'group relative flex flex-col gap-4 rounded-2xl border border-border bg-white p-5',
        'shadow-[0_1px_4px_rgba(23,43,77,0.08)]',
        'transition-all duration-200',
        'hover:border-jira-blue/40 hover:shadow-[0_4px_16px_rgba(0,82,204,0.12)] hover:-translate-y-0.5',
        'focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-2',
      )}
    >
      {/* ── Top row: avatar + role badge ─────────────────────── */}
      <div className="flex items-start justify-between">
        {/* Org avatar */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-sm"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        >
          {initial}
        </div>

        {/* Role badge */}
        <span className={cn(
          'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
          ROLE_COLORS[role]
        )}>
          {role}
        </span>
      </div>

      {/* ── Org info ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <h3 className="line-clamp-1 text-sm font-bold text-text-primary group-hover:text-jira-blue transition-colors">
          {organization.name}
        </h3>
        <p className="text-xs text-text-muted">
          /{organization.slug}
        </p>
      </div>

      {/* ── Admin-only settings hint ──────────────────────────── */}
      {isAdmin && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
          <Settings className="h-3 w-3" strokeWidth={1.8} />
          <span>Admin controls available</span>
        </div>
      )}

      {!isAdmin && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
          <Users className="h-3 w-3" strokeWidth={1.8} />
          <span>Member access</span>
        </div>
      )}
    </Link>
  )
}
