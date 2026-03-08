'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCommentAction } from '@/lib/comments/actions'
import { queryKeys } from '@/lib/query/keys'

export function useCreateComment(ticketId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => createCommentAction(ticketId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(ticketId),
      })
      // Also invalidate the ticket detail so comments_count refreshes
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      })
    },
  })
}
