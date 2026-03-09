'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { Organization, AppRole } from '@/types/database'

export interface OrgWithRole {
  organization: Organization
  role: AppRole
}

type RawJoinRow = { role: AppRole; organization: Organization }

async function fetchMyOrganizations(): Promise<OrgWithRole[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('organization_members')
    .select('role, organization:organizations(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data as RawJoinRow[]).map(row => ({
    role: row.role,
    organization: row.organization,
  }))
}

// ─────────────────────────────────────────────────────────────
//  useOrganizations
//
//  Returns all orgs the current user belongs to, split into
//  adminOrgs (role = 'admin') and memberOrgs (role = 'member').
//  Uses queryKeys.orgs.lists() so cache invalidates cleanly
//  after a new org is created.
// ─────────────────────────────────────────────────────────────
export function useOrganizations() {
  const query = useQuery({
    queryKey: queryKeys.orgs.lists(),
    queryFn:  fetchMyOrganizations,
    staleTime: 2 * 60 * 1000,
  })

  const all        = query.data ?? []
  const adminOrgs  = all.filter(o => o.role === 'admin')
  const memberOrgs = all.filter(o => o.role === 'member')

  return {
    ...query,
    adminOrgs,
    memberOrgs,
    totalCount: all.length,
  }
}
