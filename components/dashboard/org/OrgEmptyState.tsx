import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
//  OrgEmptyState — shown when the user belongs to no orgs.
//
//  Centers the icon, headline, description and a CTA slot
//  vertically in the available space. The CTA slot accepts
//  a "Create Organization" button from the parent.
// ─────────────────────────────────────────────────────────────

interface OrgEmptyStateProps {
  /** Rendered below the description — pass the CreateOrgModal trigger here */
  action: ReactNode
}

export function OrgEmptyState({ action }: OrgEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      {/* Icon container */}
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl
                      bg-jira-blue-light text-jira-blue shadow-[0_0_0_8px_#DEEBFF66]">
        <Building2 className="h-9 w-9" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-extrabold text-text-primary">
          No organizations yet
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
          Organizations let you manage tickets and collaborate with your team.
          Create your first one to get started.
        </p>
      </div>

      {/* CTA slot */}
      {action}
    </div>
  )
}
