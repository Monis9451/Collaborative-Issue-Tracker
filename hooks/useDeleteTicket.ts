'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTicketAction } from '@/lib/tickets/actions'
import { queryKeys } from '@/lib/query/keys'


export function useDeleteTicket(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => deleteTicketAction(ticketId),
    onSuccess: (_data, ticketId) => {
      // Remove from list cache immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(orgId) })
      // Remove detail cache
      queryClient.removeQueries({ queryKey: queryKeys.tickets.detail(ticketId) })
    },
  })
}
