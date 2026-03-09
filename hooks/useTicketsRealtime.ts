'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'

export function useTicketsRealtime(orgId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!orgId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`tickets-realtime-${orgId}`)

      // ── Ticket changes ─────────────────────────────────────
      .on(
        'postgres_changes',
        {
          event:  '*',          // INSERT | UPDATE | DELETE
          schema: 'public',
          table:  'tickets',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          // Invalidate the ticket list for this org.
          // TanStack Query will re-fetch in the background.
          queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.list(orgId),
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'ticket_comments',
        },
        (payload) => {
          // Narrow to just the affected ticket's comment list
          const ticketId =
            (payload.new as { ticket_id?: string })?.ticket_id ??
            (payload.old as { ticket_id?: string })?.ticket_id

          if (ticketId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.comments.list(ticketId),
            })
          }
        },
      )

      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId, queryClient])
}
