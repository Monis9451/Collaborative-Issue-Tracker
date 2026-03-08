'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { OrgMemberWithProfile } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  useOrgMembers
//  Fetches all members of an org with their profile data.
// ─────────────────────────────────────────────────────────────

type RawMemberRow = {
  id:               string
  organization_id:  string
  user_id:          string
  role:             string
  invited_by:       string | null
  joined_at:        string
  profile:          {
    id:         string
    email:      string
    full_name:  string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
  }
}

async function fetchOrgMembers(orgId: string): Promise<OrgMemberWithProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('organization_members')
    .select('*, profile:profiles!user_id(*)')   // explicit FK — org_members has two FKs to profiles
    .eq('organization_id', orgId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data as RawMemberRow[]).map(row => ({
    id:               row.id,
    organization_id:  row.organization_id,
    user_id:          row.user_id,
    role:             row.role as 'admin' | 'member',
    invited_by:       row.invited_by,
    joined_at:        row.joined_at,
    profile:          row.profile,
  }))
}

export function useOrgMembers(orgId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.members.list(orgId ?? ''),
    queryFn:  () => fetchOrgMembers(orgId!),
    enabled:  !!orgId,
  })
}
