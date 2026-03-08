'use client'

import { useState } from 'react'
import { UserPlus, Trash2 } from 'lucide-react'
import { useOrgBySlug } from '@/hooks/useOrgBySlug'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUserRole } from '@/hooks/useUserRole'
import { useOrgMembers } from '@/hooks/useOrgMembers'
import { useRemoveOrgMember } from '@/hooks/useRemoveOrgMember'
import { Sidebar } from '@/components/dashboard/sidebar/Sidebar'
import { MobileNav } from '@/components/dashboard/layout/MobileNav'
import { Spinner } from '@/components/ui/spinner'
import { AddMemberModal } from './AddMemberModal'
import { format } from 'date-fns'
import type { OrgMemberWithProfile } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  MembersPageClient
// ─────────────────────────────────────────────────────────────

interface MembersPageClientProps {
  orgSlug: string
}

export function MembersPageClient({ orgSlug }: MembersPageClientProps) {
  const { data: org,     isLoading: orgLoading,  isError: orgError } = useOrgBySlug(orgSlug)
  const { data: profile, isLoading: profileLoading }                  = useCurrentUser()
  const { data: role,    isLoading: roleLoading }                     = useUserRole(org?.id)
  const { data: members = [], isLoading: membersLoading, isError: membersError, error: membersErr } = useOrgMembers(org?.id)

  const [addOpen, setAddOpen] = useState(false)

  const loading = orgLoading || profileLoading || roleLoading

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-7 w-7 text-jira-blue" />
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────────────
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

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <Sidebar org={org} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile-only navigation strip (sidebar replacement) */}
        <MobileNav org={org} />

        {/* ── Toolbar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-border bg-white px-5 py-3">
          <h1 className="text-sm font-semibold text-text-primary">Members</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
            {role === 'admin' && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-jira-blue px-3 py-1.5
                           text-xs font-semibold text-white transition-colors
                           hover:bg-jira-blue-hover cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Add member
              </button>
            )}
          </div>
        </div>

        {/* ── Member list ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5">
          {membersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-6 w-6 text-jira-blue" />
            </div>
          ) : membersError ? (
            <p className="py-16 text-center text-sm text-danger">
              {(membersErr as Error).message}
            </p>
          ) : members.length === 0 ? (
            <p className="py-16 text-center text-sm italic text-text-muted">
              No members found.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.map(member => (
                <MemberRow
                  key={member.id}
                  member={member}
                  orgId={org.id}
                  isYou={member.user_id === profile.id}
                  viewerRole={role ?? null}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Add member modal (admin only) ─────────────────── */}
      {org && (
        <AddMemberModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          orgId={org.id}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MemberRow
// ─────────────────────────────────────────────────────────────

interface MemberRowProps {
  member:     OrgMemberWithProfile
  orgId:      string
  isYou:      boolean
  viewerRole: 'admin' | 'member' | null
}

function MemberRow({ member, orgId, isYou, viewerRole }: MemberRowProps) {
  const { profile } = member
  const isAdmin = member.role === 'admin'
  const name    = profile.full_name ?? profile.email
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const removeMember = useRemoveOrgMember(orgId)

  // Admin can delete non-admin, non-self members
  const canDelete = viewerRole === 'admin' && !isYou && !isAdmin

  const handleDelete = () => {
    if (!window.confirm(`Remove ${name} from this workspace?`)) return
    removeMember.mutate(member.id)
  }

  return (
    <li className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3
                   shadow-sm transition-shadow hover:shadow-card">
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                   bg-jira-blue text-xs font-bold text-white"
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-text-primary">{name}</p>
          {isYou && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px]
                             font-semibold uppercase tracking-wide text-text-muted">
              You
            </span>
          )}
          {isAdmin && (
            <span className="shrink-0 rounded-full bg-jira-blue/10 px-2 py-0.5 text-[10px]
                             font-semibold uppercase tracking-wide text-jira-blue">
              Admin
            </span>
          )}
        </div>
        {profile.full_name && (
          <p className="truncate text-xs text-text-muted">{profile.email}</p>
        )}
      </div>

      {/* Joined date + delete */}
      <div className="flex shrink-0 items-center gap-2">
        <p className="hidden sm:block text-[11px] text-text-muted">
          Joined {format(new Date(member.joined_at), 'dd MMM yyyy')}
        </p>
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={removeMember.isPending}
            aria-label={`Remove ${name}`}
            className="flex h-6 w-6 items-center justify-center rounded text-text-muted
                       hover:bg-danger-light hover:text-danger transition-colors
                       cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
    </li>
  )
}
