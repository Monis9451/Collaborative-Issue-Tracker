'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateTicketAction,
  updateTicketStatusAction,
  type UpdateTicketInput,
} from '@/lib/tickets/actions'
import { queryKeys } from '@/lib/query/keys'
import type { TicketStatus, TicketWithProfiles } from '@/types/database'


export function useUpdateTicket(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTicketInput) => updateTicketAction(input),
    onSuccess: (updatedTicket) => {
      // Update detail cache
      queryClient.setQueryData(
        queryKeys.tickets.detail(updatedTicket.id),
        updatedTicket,
      )
      // Invalidate list so it re-fetches with latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(orgId) })
    },
  })
}

export function useUpdateTicketStatus(orgId: string) {
  const queryClient = useQueryClient()
  const listKey = queryKeys.tickets.list(orgId)

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      updateTicketStatusAction(ticketId, status),

    // ── Optimistic update ────────────────────────────────────
    onMutate: async ({ ticketId, status }) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<TicketWithProfiles[]>(listKey)

      queryClient.setQueryData<TicketWithProfiles[]>(listKey, (old = []) =>
        old.map(t => (t.id === ticketId ? { ...t, status } : t)),
      )

      return { previous }
    },

    // ── Roll back on error ───────────────────────────────────
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey })
    },
  })
}
