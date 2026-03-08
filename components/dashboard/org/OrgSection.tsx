import type { ReactNode } from 'react'
import { OrgCard } from '@/components/dashboard/org/OrgCard'
import type { OrgWithRole } from '@/hooks/useOrganizations'

// ─────────────────────────────────────────────────────────────
//  OrgSection — labeled section containing a grid of OrgCards.
//  Renders nothing when the `orgs` array is empty.
// ─────────────────────────────────────────────────────────────

interface OrgSectionProps {
  title:           string
  subtitle?:       string
  orgs:            OrgWithRole[]
  /** Optional action (e.g. "New Org" button) rendered next to the heading */
  action?:         ReactNode
  onDeleteClick?:  (org: OrgWithRole) => void
}

export function OrgSection({ title, subtitle, orgs, action, onDeleteClick }: OrgSectionProps) {
  if (orgs.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      {/* ── Section heading ────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-text-subtle">{subtitle}</p>
          )}
        </div>
        {action}
      </div>

      {/* ── Org card grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map(({ organization, role }) => (
          <OrgCard
            key={organization.id}
            organization={organization}
            role={role}
            onDeleteClick={onDeleteClick ? () => onDeleteClick({ organization, role }) : undefined}
          />
        ))}
      </div>
    </section>
  )
}
