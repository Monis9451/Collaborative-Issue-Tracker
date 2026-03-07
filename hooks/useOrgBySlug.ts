'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { Organization } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  useOrgBySlug
//  Fetches a single org by its URL slug. Returns null if the
//  user isn't a member or the org doesn't exist.
// ─────────────────────────────────────────────────────────────

async function fetchOrgBySlug(slug: string): Promise<Organization | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Organization
}

export function useOrgBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.orgs.detail(slug ?? ''),
    queryFn:  () => fetchOrgBySlug(slug!),
    enabled:  !!slug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
