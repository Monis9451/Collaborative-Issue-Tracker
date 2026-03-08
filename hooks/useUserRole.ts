'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { AppRole } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  useUserRole
//  Returns the current user's role in a specific org ('admin'
//  | 'member' | null).  null means not a member.
// ─────────────────────────────────────────────────────────────

async function fetchUserRole(orgId: string): Promise<AppRole | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data.role as AppRole
}

export function useUserRole(orgId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.members.role(orgId ?? ''),
    queryFn:  () => fetchUserRole(orgId!),
    enabled:  !!orgId,
    staleTime: 5 * 60 * 1000,
  })
}
