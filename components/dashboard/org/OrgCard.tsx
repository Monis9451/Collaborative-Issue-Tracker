import Link from 'next/link'
import { Settings, Users, Trash2 } from 'lucide-react'
import type { AppRole, Organization } from '@/types/database'
import { cn } from '@/lib/utils'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  OrgCard â€” clickable card representing a single organization.
//
//  Admin card:  shows "Admin" badge + trash icon + settings hint.
//  Member card: simpler, no admin controls.
//
//  Clicking the card navigates to the workspace.
//  The trash button stops propagation so it never navigates.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface OrgCardProps {
  organization:   Organization
  role:           AppRole
  onDeleteClick?: () => void
}

const ROLE_COLORS: Record<AppRole, string> = {
  admin:  'bg-jira-blue-light text-jira-blue-dark',
  member: 'bg-gray-100 text-text-secondary',
}

/** Deterministic color from org name initial â€” decorative. */
function orgColor(name: string) {
  const hues = [221, 262, 197, 24, 142, 330, 48]
  const idx  = name.charCodeAt(0) % hues.length
  return `hsl(${hues[idx]}, 65%, 50%)`
}

export function OrgCard({ organization, role, onDeleteClick }: OrgCardProps) {
  const isAdmin = role === 'admin'
  const initial = (organization.name[0] ?? '?').toUpperCase()
  const color   = orgColor(organization.name)

  return (
    <div className="relative">
      <Link
        href={`/dashboard/${organization.slug}`}
        className={cn(
          'group flex flex-col gap-4 rounded-2xl border border-border bg-white p-5',
          'shadow-[0_1px_4px_rgba(23,43,77,0.08)]',
          'transition-all duration-200',
          'hover:border-jira-blue/40 hover:shadow-[0_4px_16px_rgba(0,82,204,0.12)] hover:-translate-y-0.5',
          'focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-2',
          'block',
        )}
      >
        {/* â”€â”€ Top row: avatar + badge (+ trash for admins) â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-start justify-between">
          {/* Org avatar */}
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl
                       text-lg font-extrabold text-white shadow-sm"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            {initial}
          </div>

          {/* Right side: role badge + trash icon (admin only) */}
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
              ROLE_COLORS[role],
            )}>
              {role}
            </span>

            {isAdmin && onDeleteClick && (
              <button
                type="button"
                aria-label={`Delete ${organization.name}`}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDeleteClick()
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md
                           text-text-muted transition-colors
                           hover:bg-danger-light hover:text-danger
                           cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* â”€â”€ Org info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-1 text-sm font-bold text-text-primary
                         group-hover:text-jira-blue transition-colors">
            {organization.name}
          </h3>
          <p className="text-xs text-text-muted">/{organization.slug}</p>
        </div>

        {/* â”€â”€ Footer hint â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
            <Settings className="h-3 w-3" strokeWidth={1.8} />
            <span>Admin controls available</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
            <Users className="h-3 w-3" strokeWidth={1.8} />
            <span>Member access</span>
          </div>
        )}
      </Link>
    </div>
  )
}
