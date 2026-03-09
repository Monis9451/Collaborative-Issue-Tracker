'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { TicketWithProfiles } from '@/types/database'

async function fetchTickets(orgId: string): Promise<TicketWithProfiles[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      assignee:profiles!tickets_assignee_id_fkey(*),
      creator:profiles!tickets_created_by_fkey(*)
    `)
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data as unknown as TicketWithProfiles[])
}

export function useTickets(orgId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.list(orgId ?? ''),
    queryFn:  () => fetchTickets(orgId!),
    enabled:  !!orgId,
    staleTime: 30 * 1000, // 30 seconds — tickets change frequently
  })
}
