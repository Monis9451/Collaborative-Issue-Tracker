'use client'

import { useOrgBySlug } from '@/hooks/useOrgBySlug'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUserRole } from '@/hooks/useUserRole'
import { Sidebar } from '@/components/dashboard/sidebar/Sidebar'
import { MobileNav } from '@/components/dashboard/layout/MobileNav'
import { KanbanBoard } from '@/components/dashboard/kanban/KanbanBoard'
import { Spinner } from '@/components/ui/spinner'


interface WorkspacePageClientProps {
  orgSlug: string
}

export function WorkspacePageClient({ orgSlug }: WorkspacePageClientProps) {
  const { data: org,     isLoading: orgLoading,     isError: orgError }  = useOrgBySlug(orgSlug)
  const { data: profile, isLoading: profileLoading }                      = useCurrentUser()
  const { data: role,    isLoading: roleLoading }                         = useUserRole(org?.id)

  const loading = orgLoading || profileLoading || roleLoading

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-7 w-7 text-jira-blue" />
      </div>
    )
  }

  // ── Not found / not a member ──────────────────────────────
  if (orgError || !org || !profile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="text-base font-semibold text-text-primary">Workspace not found</p>
        <p className="text-sm text-text-secondary max-w-xs">
          This workspace doesn&apos;t exist or you&apos;re not a member.
        </p>
        <a
          href="/dashboard"
          className="mt-2 text-sm font-semibold text-jira-blue hover:underline"
        >
          Back to dashboard
        </a>
      </div>
    )
  }

  // ── Workspace ─────────────────────────────────────────────
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <Sidebar org={org} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile-only navigation strip (sidebar replacement) */}
        <MobileNav org={org} />
        <KanbanBoard
          orgId={org.id}
          currentUserId={profile.id}
          userRole={role ?? null}
        />
      </div>
    </div>
  )
}
