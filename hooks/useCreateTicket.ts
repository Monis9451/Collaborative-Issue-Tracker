'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTicketAction, type CreateTicketInput } from '@/lib/tickets/actions'
import { queryKeys } from '@/lib/query/keys'


export function useCreateTicket(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicketAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(orgId) })
    },
  })
}
